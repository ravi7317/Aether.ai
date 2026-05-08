import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthCard from '../components/AuthCard';

const AuthPage = ({ mode, setMode, onBack, onLoginSuccess }) => {
  return (
    <div className="auth-page-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Cinematic Background Elements */}
      <div className="auth-bg-overlay" style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #05010D 0%, #0B0618 50%, #140A24 100%)',
        zIndex: -1
      }}></div>
      
      {/* Floating Particles / Data Stream Effect (CSS Animated) */}
      <div className="neural-trails"></div>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="auth-hero"
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <div 
          className="logo-large" 
          onClick={onBack}
          style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            cursor: 'pointer',
            background: 'linear-gradient(to bottom, #fff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))'
          }}
        >
          Aether AI
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '400px' }}>
          Experience the future of intelligent utility with our high-performance workspace.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <AuthCard mode={mode} setMode={setMode} onLoginSuccess={onLoginSuccess} onClose={onBack} />
        </motion.div>
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onBack}
        style={{
          marginTop: '2rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        &larr; Back to Home
      </motion.button>

      <style>{`
        .neural-trails {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black, transparent 80%);
          z-index: -1;
        }
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: -1;
          opacity: 0.3;
          animation: float 20s infinite alternate;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: #a855f7;
          top: -100px;
          left: -100px;
        }
        .orb-2 {
          width: 500px;
          height: 500px;
          background: #3b82f6;
          bottom: -150px;
          right: -150px;
          animation-delay: -5s;
        }
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
