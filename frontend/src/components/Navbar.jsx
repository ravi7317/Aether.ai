import React from 'react';
import { Sparkles, Github, Menu } from 'lucide-react';

const Navbar = ({ onLogin, onSignup, onBookDemo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
        
        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Features</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Pricing</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onBookDemo(); setIsMobileMenuOpen(false); }} style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Book Demo</a>
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
          
          <div className="mobile-only-actions" style={{ display: 'none', flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <button onClick={() => { onLogin(); setIsMobileMenuOpen(false); }} style={{ color: 'white', background: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '8px' }}>Login</button>
            <button onClick={() => { onSignup(); setIsMobileMenuOpen(false); }} className="btn-primary" style={{ width: '100%' }}>Sign up</button>
          </div>
        </nav>

        <div className="nav-actions" style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onSignup(); }} className="btn-primary">Sign up</a>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <Menu />
        </button>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .nav-links {
            display: none !important;
            position: absolute;
            top: 80px;
            left: 0;
            right: 0;
            background: #0a0a0c;
            flex-direction: column;
            padding: 2rem;
            gap: 1.5rem !important;
            border-bottom: 1px solid var(--card-border);
          }
          .nav-links.mobile-open {
            display: flex !important;
          }
          .nav-actions { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
          .mobile-only-actions { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
