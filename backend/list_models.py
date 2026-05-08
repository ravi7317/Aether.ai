import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Checking available models and capabilities...")
try:
    for m in genai.list_models():
        methods = ", ".join(m.supported_generation_methods)
        print(f"Model: {m.name} | Methods: {methods}")
except Exception as e:
    print(f"Error: {e}")
