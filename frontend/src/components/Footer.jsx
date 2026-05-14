import React from 'react';
import { Sparkles, Globe, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer" style={{
      padding: '5rem 0 3rem',
      borderTop: '1px solid var(--card-border)',
      background: 'rgba(5, 5, 5, 0.5)'
    }}>
      <div className="container">
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '4rem',
          marginBottom: '4rem'
        }}>
          <div className="footer-brand">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 700 }}>
              <Sparkles className="text-primary" style={{ color: 'var(--primary)' }} />
              <span style={{ fontFamily: 'Outfit, sans-serif' }}>Aether AI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', maxWidth: '300px' }}>
              The future of intelligent human-machine collaboration.
            </p>
          </div>
          
          <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div className="link-group">
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.1rem', marginBottom: '1.5rem' }}>PRODUCT</h4>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="footer-link">Features</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="footer-link">Pricing</a>
              <a href="#" className="footer-link">Changelog</a>
              <a href="#" className="footer-link">Documentation</a>
            </div>
            <div className="link-group">
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.1rem', marginBottom: '1.5rem' }}>SOCIAL</h4>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">Twitter / X</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="footer-link">Join Discord</a>
            </div>
            <div className="link-group">
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.1rem', marginBottom: '1.5rem' }}>LEGAL</h4>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Security Audit</a>
              <a href="mailto:support@aetherai.com" className="footer-link">Contact Support</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid var(--card-border)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>&copy; 2026 Aether AI Technologies Inc. All rights reserved.</p>
          <div className="social-icons" style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)' }}><Globe size={18} /></a>
            <a href="#" style={{ color: 'var(--text-muted)' }}><Mail size={18} /></a>
          </div>
        </div>
      </div>
      <style>{`
        .footer-link { display: block; color: var(--text-muted); margin-bottom: 0.8rem; font-size: 0.9rem; transition: 0.3s; }
        .footer-link:hover { color: white; }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
