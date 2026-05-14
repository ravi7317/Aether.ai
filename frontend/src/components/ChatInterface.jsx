import React, { useState, useEffect, useRef } from 'react';
import { Moon, User, Sparkles, Copy, Check, RotateCcw, Paperclip, Mic, Image as ImageIcon, Send, Loader2, Share2, ArrowDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

const ChatInterface = ({ onLogout, conversationId, onConversationStarted, onOpenProfile, onOpenSettings, onToggleSidebar, isSidebarOpen }) => {
  const [input, setInput] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flash');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const abortControllerRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const currentConvIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const actionBtnStyle = {
    background: 'rgba(20, 20, 20, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '0.4rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/conversations`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Initialize/Clear messages when conversationId changes
  useEffect(() => {
    // If the conversationId prop matches what we are already showing, don't re-fetch
    if (conversationId === currentConvIdRef.current && messages.length > 1) {
      return;
    }

    if (conversationId) {
      currentConvIdRef.current = conversationId;
      // Load existing conversation
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages);
          }
        } catch (error) {
          console.error("Failed to load history", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else {
      currentConvIdRef.current = null;
      // New chat state
      setMessages([
        { role: 'model', content: "Welcome back to Aether AI. Start a new session or choose from your history." }
      ]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
      }
    };
    const scrollEl = scrollRef.current;
    if (scrollEl) scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    const currentInput = input;
    setLastPrompt(currentInput);
    const userMessage = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    const textarea = document.querySelector('.chat-input-textarea');
    if (textarea) textarea.style.height = 'auto';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: currentInput.includes('--- CONTENT FROM UPLOADED FILE')
            ? `[SYSTEM HINT: The user has uploaded one or more documents. Use the provided text below to answer.]\n\n${currentInput}`
            : currentInput,
          history: messages.slice(-10),
          conversation_id: conversationId,
          model: selectedModel
        })
      });

      if (!response.ok) throw new Error('Backend error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { role: 'model', content: '' };

      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.text) {
                aiMessage.content += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...aiMessage };
                  return updated;
                });
              }
              if (data.conversation_id && data.conversation_id !== conversationId) {
                currentConvIdRef.current = data.conversation_id; // Update ref so useEffect skips re-fetch
                onConversationStarted(data.conversation_id);
              }
              if (data.error) throw new Error(data.error);
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'model', content: "_Generation stopped by user._" }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "Error: Could not connect to the Aether AI service." }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    alert("Message copied to clipboard!");
  };

  const handleShareMessage = (content) => {
    if (navigator.share) {
      navigator.share({ title: 'Aether AI Message', text: content })
        .catch(() => handleCopyMessage(content));
    } else {
      handleCopyMessage(content);
    }
  };

  const handleRegenerate = () => {
    if (lastPrompt) {
      setInput(lastPrompt);
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }, 50);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRevert = () => {
    if (messages.length < 2) return;
    // Remove last two messages (User + AI)
    setMessages(prev => prev.slice(0, -2));
    setInput(lastPrompt);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      const docPayload = `--- CONTENT FROM UPLOADED FILE (${data.filename}) ---\n${data.content}\n--- END OF FILE CONTENT ---`;
      const autoPrompt = `I have uploaded ${data.filename}. Please analyze this document and tell me everything important about it in a clean, structured format.`;

      setInput(docPayload + "\n\n" + autoPrompt);
      setTimeout(() => {
        document.querySelector('form')?.requestSubmit();
      }, 100);
    } catch (error) {
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const toggleRecording = async () => {
    console.log("Mic button clicked. Current state:", isRecording ? "Recording" : "Idle");

    if (isRecording && mediaRecorder) {
      console.log("Stopping recording...");
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      console.log("Requesting microphone access...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted.");

        // Set up Audio Analysis
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const updateLevel = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          console.log("Recording stopped. Processing audio...");
          const blob = new Blob(chunks, { type: 'audio/webm' });
          console.log("Audio blob created. Size:", blob.size);

          if (blob.size < 100) {
            console.warn("Audio blob too small, likely no sound captured.");
            return;
          }

          const formData = new FormData();
          formData.append('file', blob, 'recording.webm');

          setIsLoading(true);
          try {
            const token = localStorage.getItem('token');
            console.log("Sending audio to backend...");
            const response = await fetch(`${API_URL}/api/speech-to-text`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.detail || 'STT failed');
            }

            const data = await response.json();
            console.log("Transcription received:", data.text);
            if (data.text) setInput(prev => prev + (prev ? ' ' : '') + data.text);
          } catch (error) {
            console.error("STT Error:", error);
            alert(`Voice transcription failed: ${error.message}`);
          } finally {
            setIsLoading(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            setAudioLevel(0);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        console.log("Recording started.");
      } catch (err) {
        console.error("Microphone access error:", err);
        alert("Microphone access denied or not available. Please check your browser settings.");
      }
    }
  };

  const [copyStatus, setCopyStatus] = useState({});

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopyStatus(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;

    // 1. Split by code blocks
    const parts = content.split('```');

    return parts.map((part, i) => {
      // It's a code block
      if (i % 2 === 1) {
        const lines = part.split('\n');
        const lang = lines[0].trim() || 'code';
        const code = lines.slice(1).join('\n').trim();
        const codeId = `code-${i}`;
        return (
          <div key={i} className="code-container" style={{
            background: '#0d0d0d',
            borderRadius: '16px',
            margin: '1.5rem 0',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            fontFamily: 'JetBrains Mono, Menlo, monospace'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              background: 'rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{lang}</span>
              </div>
              <button
                onClick={() => handleCopyCode(code, codeId)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copyStatus[codeId] ? '#27c93f' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.7rem',
                  transition: '0.2s',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.03)'
                }}
              >
                {copyStatus[codeId] ? <Check size={14} /> : <Copy size={14} />}
                {copyStatus[codeId] ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            <pre style={{
              padding: '1.5rem',
              overflowX: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#e6edf3'
            }}><code>{code}</code></pre>
          </div>
        );
      }

      // It's normal text
      let text = part;
      // Bold
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italics
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      text = text.replace(/_(.*?)_/g, '<em>$1</em>');
      // Inline code
      text = text.replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 4px; font-family: monospace;">$1</code>');

      return text.split('\n').map((line, j) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={j} style={{ height: '0.5rem' }} />;

        // Headers
        if (trimmed.startsWith('#### ')) {
          return <h4 key={j} style={{ color: 'white', margin: '1.2rem 0 0.6rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: trimmed.replace('#### ', '') }} />;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={j} style={{ color: 'var(--primary)', margin: '1.5rem 0 0.8rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: trimmed.replace('### ', '') }} />;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={j} style={{ color: 'white', margin: '1.8rem 0 1rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: trimmed.replace('## ', '') }} />;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={j} style={{ color: 'white', margin: '2rem 0 1.2rem', fontWeight: 800 }} dangerouslySetInnerHTML={{ __html: trimmed.replace('# ', '') }} />;
        }

        // Lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <li key={j} style={{ marginLeft: '1.2rem', marginBottom: '0.4rem', listStyleType: 'disc', color: 'rgba(255,255,255,0.9)' }}>
              <span dangerouslySetInnerHTML={{ __html: trimmed.replace(/^[*•-]\s?/, '') }} />
            </li>
          );
        }

        // Paragraph
        return (
          <p key={j} style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }} dangerouslySetInnerHTML={{ __html: trimmed }} />
        );
      });
    });
  };

  return (
    <div className="chat-interface" 
         style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
         onDragLeave={() => setIsDragging(false)}
         onDrop={handleDrop}>
      
      <AnimatePresence>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--primary)', borderRadius: '20px' }}>
            <p style={{ color: 'white', fontWeight: 600 }}>Drop file to upload</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="chat-nav" style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: window.innerWidth <= 768 ? '0 1rem' : '0 2rem',
        borderBottom: '1px solid var(--card-border)',
        background: 'rgba(5, 1, 13, 0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 5
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onToggleSidebar}
            style={{
              display: window.innerWidth <= 768 ? 'flex' : 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', opacity: 0.9 }}>
          {conversationId ? "Active Session" : "New Chat"}
        </h2>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', alignItems: 'center' }}>
          <motion.div 
            animate={isLoading ? {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: isLoading ? '0 0 15px var(--primary)' : 'none'
            }}
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.4rem 0.75rem',
            borderRadius: '99px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.75rem',
            color: isOnline ? '#4ade80' : '#ef4444',
            fontWeight: 600,
            letterSpacing: '0.02rem'
          }}>
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isOnline ? '#4ade80' : '#ef4444',
                boxShadow: isOnline ? '0 0 10px rgba(74, 222, 128, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)'
              }} 
            />
            <span>{isOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}</span>
          </div>

          <button className="nav-icon-btn profile" onClick={onOpenProfile} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center'
          }}>
            <User size={18} />
          </button>
        </div>
      </header>

      <div 
        ref={scrollRef} 
        style={{ flex: 1, overflowY: 'auto', padding: window.innerWidth <= 768 ? '1rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}
      >
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            transition={{ 
              type: 'spring', 
              damping: 12, 
              stiffness: 100,
              delay: idx === messages.length - 1 ? 0 : 0.05 
            }} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
              maxWidth: '85%',
              position: 'relative'
            }}
            className="message-wrapper"
          >
            <div style={{
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              padding: '1.25rem 1.75rem',
              background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), #7c3aed)' : 'rgba(255, 255, 255, 0.03)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              color: 'white',
              boxShadow: msg.role === 'user' ? '0 10px 30px -10px rgba(168, 85, 247, 0.5)' : 'none',
              position: 'relative',
              transition: '0.3s'
            }}>
              <div className="message-actions" style={{
                position: 'absolute',
                top: '-15px',
                right: msg.role === 'user' ? '0' : 'auto',
                left: msg.role === 'user' ? 'auto' : '0',
                display: 'flex',
                gap: '0.5rem',
                opacity: 0,
                transition: '0.2s',
                zIndex: 10
              }}>
                <button onClick={() => handleCopyMessage(msg.content)} title="Copy" style={actionBtnStyle} className="hover-action"><Copy size={12} /></button>
                {msg.role === 'model' && <button onClick={handleRegenerate} title="Regenerate" style={actionBtnStyle} className="hover-action"><RotateCcw size={12} /></button>}
                <button onClick={() => handleShareMessage(msg.content)} title="Share" style={actionBtnStyle} className="hover-action"><Share2 size={12} /></button>
              </div>

              {msg.role === 'user' && (
                <button 
                  onClick={() => {
                    setMessages(prev => prev.slice(0, idx));
                    setInput(msg.content);
                  }}
                  title="Revert to this message"
                  style={{
                    position: 'absolute',
                    bottom: '-25px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.7rem',
                    opacity: 0.6,
                    transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.6}
                >
                  <RotateCcw size={12} />
                  <span>EDIT</span>
                </button>
              )}
              {msg.role === 'model' ? (
                <div className="ai-content">
                  {renderFormattedContent(msg.content)}
                </div>
              ) : (
                <div className="user-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content.includes('--- CONTENT FROM UPLOADED FILE') 
                    ? msg.content.split('--- END OF FILE CONTENT ---')[1]?.trim() || "Analyzing document..."
                    : msg.content}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: '1rem' }}>
            <Loader2 className="spinning" style={{ color: 'var(--primary)' }} size={20} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thinking...</span>
          </div>
        )}
      </div>
      
      <div style={{ padding: window.innerWidth <= 768 ? '0 1rem 1rem' : '0 2rem 2rem' }}>
        <form onSubmit={handleSend} style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: isRecording ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '20px', 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          backdropFilter: 'blur(20px)',
          boxShadow: isRecording ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          {isRecording && (
            <div className="voice-waves-container" style={{ 
              position: 'absolute', 
              inset: 0, 
              overflow: 'hidden', 
              borderRadius: '20px',
              zIndex: 0,
              pointerEvents: 'none'
            }}>
              <div className="voice-waves" style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '0 4rem',
                opacity: 0.4
              }}>
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    // Dramatic spikes: use power for non-linear scaling
                    height: audioLevel > 5 
                      ? [4, (Math.random() * 35 + 10) * (audioLevel / 30), 4] 
                      : 4,
                    opacity: audioLevel > 5 ? 0.8 : 0.2
                  }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                  style={{
                    width: '3px',
                    background: 'var(--primary)',
                    borderRadius: '4px',
                    boxShadow: audioLevel > 20 ? '0 0 10px var(--primary)' : 'none'
                  }}
                />
              ))}
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept=".pdf,.txt,.md,.js,.py,.jsx,.ts,.tsx"
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            style={{ color: isUploading ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}
          >
            {isUploading ? <Loader2 size={18} className="spinning" /> : <Paperclip size={18} />}
          </button>

          <div className="model-dropdown-container" style={{ position: 'relative', marginRight: '0.5rem' }}>
            <button 
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span>{selectedModel.toUpperCase()}</span>
              <motion.span animate={{ rotate: showModelDropdown ? 180 : 0 }}>▼</motion.span>
            </button>

            {showModelDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '0.5rem',
                  background: 'rgba(20, 20, 20, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  minWidth: '150px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 100
                }}
              >
                <div 
                  onClick={() => { setSelectedModel('flash'); setShowModelDropdown(false); }}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedModel === 'flash' ? 'rgba(168, 85, 247, 0.1)' : 'none',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Llama 3.1 8B</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Ultra-Fast & Efficient</div>
                </div>
                <div 
                  onClick={() => { setSelectedModel('pro'); setShowModelDropdown(false); }}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedModel === 'pro' ? 'rgba(168, 85, 247, 0.1)' : 'none',
                    marginTop: '0.25rem',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Llama 3.3 70B</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Advanced Reasoning</div>
                </div>
              </motion.div>
            )}
          </div>
          
          <textarea 
            className="chat-input-textarea"
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              outline: 'none', 
              fontSize: '0.95rem',
              resize: 'none',
              maxHeight: '200px',
              padding: '8px 0',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              height: '40px',
              overflowY: 'auto'
            }} 
            placeholder={isRecording ? "Listening..." : "Ask Aether AI anything..."} 
            value={input}
            rows={1}
            onInput={(e) => {
              e.target.style.height = '40px';
              const newHeight = Math.min(e.target.scrollHeight, 200);
              e.target.style.height = newHeight + 'px';
            }}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <button 
            type="button" 
            onClick={toggleRecording}
            style={{ color: isRecording ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', margin: '0 0.5rem' }}
          >
            {isRecording ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Mic size={20} /></motion.div> : <Mic size={20} />}
          </button>
          
          {isLoading ? (
            <button 
              type="button"
              onClick={handleStopGeneration}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Stop Generation"
            >
              <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '2px' }} />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              opacity: input.trim() ? 1 : 0.5,
              transition: '0.3s'
            }}>
              <Send size={18} />
            </button>
          )}
        </form>
      </div>

        {/* Floating Scroll to Bottom */}
        <AnimatePresence>
          {showScrollBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToBottom}
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(168, 85, 247, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
                zIndex: 100
              }}
            >
              <ArrowDown size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        .message-wrapper:hover .message-actions {
          opacity: 1 !important;
          transform: translateY(-5px);
        }
        .hover-action:hover {
          color: white !important;
          border-color: var(--primary) !important;
          background: rgba(168, 85, 247, 0.2) !important;
        }

        @media (max-width: 768px) {
          .chat-nav { padding: 0 1rem !important; }
          .message-wrapper { max-width: 95% !important; }
          .message-wrapper > div { padding: 1rem !important; font-size: 0.85rem !important; }
          .chat-input-textarea { font-size: 0.9rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
