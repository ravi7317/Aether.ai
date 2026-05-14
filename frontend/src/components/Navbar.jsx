import React from 'react';
import { Sparkles, Github, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onLogin, onSignup, onBookDemo }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="navbar">
      <div className="container">
        <div className="logo">
          <Sparkles className="text-primary" />
          <span>Aether AI</span>
        </div>
        
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onBookDemo(); }}>Book Demo</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="github-link">
            <Github size={18} /> Github
          </a>
        </nav>

        <div className="nav-actions">
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onSignup(); }} className="btn-primary">Sign up</a>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu />
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
          >
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onBookDemo(); setIsMenuOpen(false); }}>Book Demo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); setIsMenuOpen(false); }}>Login</a>
            <button className="btn-primary" onClick={() => { onSignup(); setIsMenuOpen(false); }}>Sign up</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
