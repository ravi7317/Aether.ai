import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialCard = ({ quote, author, role, image, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="testimonial-card"
    style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      padding: '2rem',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}
  >
    <div style={{ display: 'flex', gap: '0.2rem', color: '#fbbf24' }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
    </div>
    <p style={{ fontStyle: 'italic', color: '#cbd5e1' }}>"{quote}"</p>
    <div className="author" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
      <img src={image} alt={author} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#334155' }} />
      <div className="author-info">
        <strong style={{ display: 'block', fontSize: '0.95rem' }}>{author}</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role}</span>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => {
  const reviews = [
    {
      quote: "Aether AI has completely changed how our development team manages documentation. It's faster than any alternative I've tried.",
      author: "Marcus Chen",
      role: "CTO, Nexus Corp",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    {
      quote: "The glassmorphic UI is just the cherry on top. The actual AI logic is incredibly precise and context-aware.",
      author: "Sarah Jenkins",
      role: "Design Lead, Flex",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      quote: "Integration was seamless. We were up and running with the API in less than 30 minutes. Exceptional dev experience.",
      author: "Leo Rodriguez",
      role: "Founder, BuildFast",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo"
    }
  ];

  return (
    <section className="testimonials" style={{ padding: '8rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Loved by Builders</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="testimonial-grid">
          {reviews.map((review, index) => (
            <TestimonialCard key={index} {...review} delay={index * 0.1} />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .testimonial-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
