import os
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import io
import uuid
import asyncio
import hashlib
import redis
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from groq import Groq
from dotenv import load_dotenv
from pypdf import PdfReader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import SYSTEM_INSTRUCTION

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "aether-ai-super-secret-key-2026") # In prod, use a real secret!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aether-ai-backend")

# Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    masked_key = GROQ_API_KEY[:7] + "..." + GROQ_API_KEY[-4:] if len(GROQ_API_KEY) > 10 else "***"
    logger.info(f"Groq API Key loaded: {masked_key}")
    client = Groq(api_key=GROQ_API_KEY)
else:
    logger.error("GROQ_API_KEY NOT FOUND in environment variables!")

# Security - Using pbkdf2_sha256 to avoid bcrypt binary issues on Windows/Python 3.14
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Database Setup (Supabase/PostgreSQL)
def get_db_connection():
    DATABASE_URL = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Conversations table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            title TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Messages table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    ''')
    # Demo Bookings table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS demo_bookings (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            university TEXT NOT NULL,
            goal TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()

init_db()

# Models
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class DemoBooking(BaseModel):
    name: str
    email: str
    university: str
    goal: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    conversation_id: Optional[str] = None
    model: Optional[str] = "flash"

# Auth Utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Bcrypt has a 72-character limit; truncating prevents ValueErrors on some systems
    return pwd_context.hash(password[:72])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

# Initialize FastAPI
# Rate Limiting & Caching Config
def get_user_key(request: Request):
    # This assumes the user is already authenticated and attached to request state
    # We'll need a middleware or custom logic to handle this for slowapi
    return request.state.user if hasattr(request.state, 'user') else get_remote_address(request)

limiter = Limiter(key_func=get_user_key)
app = FastAPI(title="Aether AI Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Redis setup with fallback
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_connect_timeout=1)
    redis_client.ping()
    logger.info("Connected to Redis for caching")
except Exception as e:
    logger.warning(f"Redis not available, caching disabled: {e}")
    redis_client = None

def get_cache_key(user_email, message, history):
    # Create a unique hash for the conversation state
    history_str = json.dumps([h.dict() for h in history])
    combined = f"{user_email}:{message}:{history_str}"
    return f"aether:cache:{hashlib.md5(combined.encode()).hexdigest()}"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Aether AI Backend is Active", "version": "1.2.0", "timestamp": "2026-05-14"}

# Endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        hashed_pw = get_password_hash(user.password)
        cur.execute('INSERT INTO users (email, password, name) VALUES (%s, %s, %s)',
                     (user.email, hashed_pw, user.name))
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "User registered successfully"}
    except psycopg2.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        logger.error(f"Signup System Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s', (form_data.username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user or not verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user['email']})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user/profile")
@app.get("/api/me") # Fallback route
async def get_user_profile(current_user: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    # Count messages sent by user
    cur.execute('''
        SELECT COUNT(*) FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.user_email = %s AND m.role = 'user'
    ''', (current_user,))
    msg_count = cur.fetchone()['count']
    
    cur.execute('SELECT email, name FROM users WHERE email = %s', (current_user,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    return {
        "name": user['name'] or user['email'],
        "email": user['email'],
        "stats": {
            "messages_sent": msg_count,
            "tokens_estimated": msg_count * 150, # Rough estimate
            "plan_type": "Pro Plan",
            "member_since": "May 2026"
        },
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user['email']}"
    }

@app.get("/api/conversations")
async def get_conversations(current_user: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM conversations WHERE user_email = %s ORDER BY updated_at DESC', (current_user,))
    convs = cur.fetchall()
    cur.close()
    conn.close()
    return convs

@app.delete("/api/conversations/{conv_id}")
async def delete_conversation(conv_id: str, current_user: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM messages WHERE conversation_id = %s', (conv_id,))
    cur.execute('DELETE FROM conversations WHERE id = %s AND user_email = %s', (conv_id, current_user))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Conversation deleted"}

@app.post("/api/chat")
@limiter.limit("5/minute")
async def chat_endpoint(chat_req: ChatRequest, request: Request, current_user: str = Depends(get_current_user)):
    # Attach user to request state for rate limiter
    request.state.user = current_user
    
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    # 1. Check Cache
    cache_key = get_cache_key(current_user, chat_req.message, chat_req.history)
    if redis_client:
        cached_response = redis_client.get(cache_key)
        if cached_response:
            logger.info(f"Cache hit for {current_user}")
            # Even for cached responses, we'll stream them back to maintain UI feel
            async def stream_cache():
                data = json.loads(cached_response)
                # Stream the text in chunks to simulate generation
                text = data['text']
                conv_id = data['conversation_id']
                chunk_size = 50
                for i in range(0, len(text), chunk_size):
                    chunk = text[i:i+chunk_size]
                    yield f"data: {json.dumps({'text': chunk, 'conversation_id': conv_id})}\n\n"
                    await asyncio.sleep(0.01)
            return StreamingResponse(stream_cache(), media_type="text/event-stream")

    # 2. Proceed with AI if no cache
    conv_id = chat_req.conversation_id or str(uuid.uuid4())
    
    # Determine Model
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Ensure conversation exists
        cur.execute('SELECT id FROM conversations WHERE id = %s', (conv_id,))
        existing = cur.fetchone()
        if not existing:
            title = chat_req.message[:30] + "..."
            cur.execute('INSERT INTO conversations (id, user_email, title) VALUES (%s, %s, %s)',
                         (conv_id, current_user, title))
        
        # Save user message
        cur.execute('INSERT INTO messages (conversation_id, role, content) VALUES (%s, %s, %s)',
                     (conv_id, "user", chat_req.message))
        conn.commit()
        cur.close()
        conn.close()

        # Get AI Response (Streaming) with Groq
        async def event_generator():
            full_response = ""
            if not client:
                yield f"data: {json.dumps({'error': 'Groq Client not initialized. Check API key.'})}\n\n"
                return

            try:
                # Prepare history for Groq (OpenAI format)
                messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
                for m in chat_req.history:
                    # Map 'model' role to 'assistant' for Groq compatibility
                    role = "assistant" if m.role == "model" else m.role
                    messages.append({"role": role, "content": m.content})
                
                # Add current message
                messages.append({"role": "user", "content": chat_req.message})

                # Determine model
                # llama-3.3-70b-versatile is the high-end model
                # llama-3.1-8b-instant is the fast model
                target_model = 'llama-3.1-8b-instant' if chat_req.model == 'flash' else 'llama-3.3-70b-versatile'
                
                # Stream response
                completion = client.chat.completions.create(
                    model=target_model,
                    messages=messages,
                    temperature=0.7,
                    stream=True,
                )

                for chunk in completion:
                    content = chunk.choices[0].delta.content
                    if content:
                        full_response += content
                        yield f"data: {json.dumps({'text': content, 'conversation_id': conv_id})}\n\n"

            except Exception as e:
                logger.error(f"Groq SDK Error: {e}")
                yield f"data: {json.dumps({'error': f'Groq Error: {str(e)}'})}\n\n"
                return

            # Save full AI message at the end
            try:
                conn_save = get_db_connection()
                cur_save = conn_save.cursor()
                cur_save.execute('INSERT INTO messages (conversation_id, role, content) VALUES (%s, %s, %s)',
                             (conv_id, "model", full_response))
                cur_save.execute('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (conv_id,))
                conn_save.commit()
                # Cache the full response if Redis is active
                if redis_client:
                    redis_client.setex(
                        cache_key, 
                        3600, # Cache for 1 hour
                        json.dumps({'text': full_response, 'conversation_id': conv_id})
                    )
                cur_save.close()
                conn_save.close()
            except Exception as e:
                logger.error(f"Save Error: {e}")

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    try:
        content = await file.read()
        filename = file.filename.lower()
        extracted_text = ""

        if filename.endswith('.pdf'):
            pdf = PdfReader(io.BytesIO(content))
            for page in pdf.pages:
                extracted_text += page.extract_text() + "\n"
        elif filename.endswith(('.txt', '.md', '.js', '.py', '.jsx', '.ts', '.tsx', '.css', '.html')):
            extracted_text = content.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        return {
            "filename": file.filename,
            "content": extracted_text[:5000], # Limit content for now
            "message": f"Successfully processed {file.filename}"
        }
    except Exception as e:
        logger.error(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech-to-text")
async def speech_to_text(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    try:
        audio_content = await file.read()
        logger.info(f"STT: Received file {file.filename}, type: {file.content_type}, size: {len(audio_content)} bytes")
        
        if len(audio_content) == 0:
            return {"text": ""}

        if not client:
            raise HTTPException(status_code=500, detail="Groq Client not initialized.")

        # Sanitize mime type
        mime_type = file.content_type.split(';')[0]
        
        # Use Groq Whisper for STT (Very fast!)
        transcription = client.audio.transcriptions.create(
            file=(file.filename, audio_content),
            model="whisper-large-v3",
            response_format="text",
        )
        
        return {"text": transcription.strip()}

    except Exception as e:
        logger.error(f"Groq STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Groq STT Error: {str(e)}")


# Demo Bookings
@app.post("/api/demo-booking")
async def create_demo_booking(booking: DemoBooking):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO demo_bookings (name, email, university, goal) VALUES (%s, %s, %s, %s)",
            (booking.name, booking.email, booking.university, booking.goal)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"status": "success", "message": "Booking saved successfully"}
    except Exception as e:
        logger.error(f"Booking error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save booking")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
