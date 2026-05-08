import React from 'react';
import { MessageSquare, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="feature-card"
    style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      padding: '2.5rem',
      borderRadius: '24px',
      backdropFilter: 'blur(var(--glass-blur))',
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      background: 'var(--primary-muted)',
      color: 'var(--primary)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    }}>
      <Icon size={24} />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{description}</p>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" style={{ padding: '8rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Engineered for Performance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Built using state-of-the-art transformer models to ensure your interactions are more than just text—they're transformations.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="feature-grid">
          <FeatureCard 
            icon={MessageSquare}
            title="AI Chat"
            description="Natural language processing that feels indistinguishable from human interaction, maintaining deep context over long sessions."
            delay={0}
          />
          <FeatureCard 
            icon={Zap}
            title="Fast Responses"
            description="Optimized low-latency inference engine delivering results in milliseconds, even for the most complex reasoning tasks."
            delay={0.2}
          />
          <FeatureCard 
            icon={Shield}
            title="Secure Conversations"
            description="Enterprise-grade encryption and privacy controls ensuring your proprietary data remains strictly yours."
            delay={0.4}
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
