import React from 'react';
import { MessageSquare, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -10, scale: 1.02 }}
    transition={{ duration: 0.6, delay }}
    className="feature-card"
    style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '2.5rem',
      borderRadius: '24px',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Hover Glow */}
    <div className="hover-glow" style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
      opacity: 0,
      transition: 'opacity 0.3s',
      pointerEvents: 'none'
    }} />

    <div style={{
      width: '48px',
      height: '48px',
      background: 'var(--primary-muted)',
      color: 'var(--primary)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      position: 'relative',
      zIndex: 1
    }}>
      <Icon size={24} />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>{description}</p>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" style={{ padding: '8rem 0', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Engineered for Performance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Built using state-of-the-art transformer models to ensure your interactions are more than just text—they're transformations.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="feature-grid">
          <FeatureCard 
            icon={MessageSquare}
            title="Reasoning Engine"
            description="Deep logical analysis for coding, debugging, and complex problem solving tasks."
            delay={0}
          />
          <FeatureCard 
            icon={Zap}
            title="Real-time Speed"
            description="Ultra-low latency streaming responses that appear as fast as you can think."
            delay={0.1}
          />
          <FeatureCard 
            icon={Shield}
            title="Privacy First"
            description="Enterprise-grade security where your data is never used for training without consent."
            delay={0.2}
          />
          <FeatureCard 
            icon={MessageSquare}
            title="Context Memory"
            description="Remembers your preferences and past interactions for a truly personal assistant."
            delay={0.3}
          />
          <FeatureCard 
            icon={Zap}
            title="Hyper-Efficient"
            description="Optimized for productivity with keyboard shortcuts and voice-to-text integration."
            delay={0.4}
          />
          <FeatureCard 
            icon={Shield}
            title="Always Available"
            description="99.9% uptime with global distributed server architecture for instant access."
            delay={0.5}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          h2 { font-size: 2.2rem !important; }
        }
        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(168, 85, 247, 0.3) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
};

export default Features;
