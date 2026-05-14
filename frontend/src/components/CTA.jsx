import React from 'react';

const CTA = ({ onGetStarted }) => {
  return (
    <section className="cta" style={{ padding: '8rem 0' }}>
      <div className="container">
        <div className="cta-card" style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.05))',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '32px',
          padding: '5rem 2rem',
          textAlign: 'center',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: '1.5rem' }}>Ready to transform your workflow?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-p)', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Join over 50,000+ teams using Aether AI to automate the mundane and focus on the extraordinary.
          </p>
          <div className="cta-btns" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Get Started for Free</a>
            <a href="#" className="btn-secondary" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              color: 'white',
              padding: '0.8rem 2rem',
              borderRadius: '99px',
              fontWeight: 600
            }}>Book a Demo</a>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cta-card h2 { font-size: 2.5rem !important; }
          .cta-btns { flex-direction: column; }
        }
      `}</style>
    </section>
  );
};

export default CTA;
