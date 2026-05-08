import React from 'react';
import { Sparkles, Github, Menu } from 'lucide-react';

const Navbar = ({ onLogin, onSignup, onBookDemo }) => {
  return (
    <header className="navbar" style={{
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      background: 'rgba(10, 10, 12, 0.7)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      borderBottom: '1px solid var(--card-border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div className="logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1.5rem',
          fontWeight: 700
        }}>
          <Sparkles className="text-primary" style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>Aether AI</span>
        </div>
        
        <nav className="nav-links" style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <a href="#features" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Pricing</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onBookDemo(); }} style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Book Demo</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ 
            color: 'var(--text-muted)', 
            fontWeight: 500, 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Github size={18} /> Github
          </a>
        </nav>

        <div className="nav-actions" style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onSignup(); }} className="btn-primary">Sign up</a>
        </div>

        <button className="mobile-menu-toggle" style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer'
        }}>
          <Menu />
        </button>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .nav-links, .nav-actions { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
