import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Sparkles, MoreVertical, Lightbulb, X, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Terminal = () => {
  const [inputText, setInputText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState('typing-input');
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const scenarios = [
    {
      input: "Welcome Aether AI",
      response: "Aether AI is a next-generation intelligence platform designed for high-performance productivity. We provide hyper-fast, context-aware assistance for coding, research, and complex problem-solving. Welcome to the future of workspace intelligence."
    },
    {
      input: "Write a React hook for fetching data",
      response: "Sure! Here's a clean implementation:\n\nconst useFetch = (url) => {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url).then(res => res.json()).then(setData);\n  }, [url]);\n  return data;\n};"
    },
    {
      input: "Summarize my research on Quantum Computing",
      response: "Quantum computing utilizes superposition and entanglement to perform calculations exponentially faster than classical computers. Key players include Google, IBM, and IonQ, focusing on error correction and stable qubits."
    }
  ];

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    if (phase === 'typing-input') {
      let i = 0;
      const interval = setInterval(() => {
        setInputText(currentScenario.input.slice(0, i));
        i++;
        if (i > currentScenario.input.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('sending'), 500);
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (phase === 'sending') {
      setTimeout(() => {
        setPhase('typing-response');
      }, 800);
    } else if (phase === 'typing-response') {
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(currentScenario.response.slice(0, i));
        i++;
        if (i > currentScenario.response.length) {
          clearInterval(interval);
          setTimeout(() => {
            setInputText('');
            setTypedText('');
            setPhase('typing-input');
            setScenarioIndex((prev) => (prev + 1) % scenarios.length);
          }, 4000);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [phase, scenarioIndex]);

  return (
    <div className="terminal-container" style={{
      background: 'rgba(15, 15, 20, 0.8)',
      border: '1px solid var(--card-border)',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      width: '100%',
      minHeight: '480px'
    }}>
      <div className="terminal-header" style={{
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div className="terminal-dots" style={{ display: 'flex', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Aether Terminal</div>
        <MoreVertical size={16} color="var(--text-muted)" />
      </div>

      <div className="terminal-body" style={{ padding: '1.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {phase !== 'typing-input' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-message user" 
            style={{ display: 'flex', gap: '1rem' }}
          >
            <div className="avatar" style={{ width: '32px', height: '32px', background: '#334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div style={{ background: 'var(--primary-muted)', padding: '0.8rem 1rem', borderRadius: '12px 0 12px 12px', fontSize: '0.9rem', maxWidth: '85%', color: 'white' }}>
              {currentScenario.input}
            </div>
          </motion.div>
        )}

        {phase === 'typing-response' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-message ai" 
            style={{ display: 'flex', gap: '1rem' }}
          >
            <div className="avatar ai-avatar" style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem 1rem', borderRadius: '0 12px 12px 12px', fontSize: '0.9rem', maxWidth: '85%', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)' }}>
              {typedText}
              {typedText.length < currentScenario.response.length && (
                <div className="typing-indicator" style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="terminal-footer" style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid var(--card-border)' }}>
        <div className="input-wrapper" style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Lightbulb size={16} color="#eab308" />
          <input type="text" placeholder="Suggest real-world applications?" style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.8rem', width: '100%', outline: 'none' }} />
          <X size={14} color="#64748b" />
        </div>
        <div className="input-main" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            value={phase === 'typing-input' ? inputText : ''} 
            readOnly
            placeholder="Type your prompt here..." 
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }} 
          />
          <button style={{ 
            position: 'absolute', 
            right: '8px', 
            background: phase === 'sending' ? 'white' : 'var(--primary)', 
            border: 'none', 
            color: phase === 'sending' ? 'black' : 'white', 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            transition: '0.3s'
          }}>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
      <style>{`
        .dot { width: 4px; height: 4px; background: #64748b; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

const Hero = ({ onGetStarted, onTryDemo }) => {
  return (
    <section className="hero" style={{ padding: '6rem 0', overflow: 'hidden' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-muted)',
            color: '#e879f9',
            padding: '0.4rem 1rem',
            borderRadius: '99px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginBottom: '2rem'
          }}>
            <CheckCircle2 size={14} />
            <span>v1.2.0 is now live</span>
          </div>
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800 }}>
            Your Intelligent <br /><span className="gradient-text">AI Assistant</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '520px' }}>
            Experience the next generation of productivity. Aether AI seamlessly integrates into your workflow, providing hyper-fast responses and secure context-aware assistance.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }} className="btn-primary-large">Get Started</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onTryDemo(); }} className="btn-secondary-large">Book Demo</a>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hero-visual"
        >
          <Terminal />
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .hero .container { grid-template-columns: 1fr; text-align: center; }
          .hero-content { margin: 0 auto; }
          h1 { font-size: 3.5rem !important; }
          div[style*="display: flex; gap: 1rem"] { justify-content: center; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
