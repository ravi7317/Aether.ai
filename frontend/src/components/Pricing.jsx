import React from 'react';
import { Check, Sparkles, Zap, Shield, Globe, Terminal, Box, Layers, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const plans = [
    {
      name: 'Aether Free',
      price: '₹0',
      period: '/free',
      bestFor: 'Students, beginners, and casual users.',
      icon: <Zap size={24} className="text-primary" />,
      features: [
        'Basic AI chat access',
        'Llama 3.1 8B access',
        'Basic PDF upload (10MB)',
        'Basic image analysis',
        '20 messages/day',
        'Standard response speed',
        'Community support'
      ],
      color: 'rgba(255, 255, 255, 0.05)',
      buttonText: 'Get Started',
      featured: false
    },
    {
      name: 'Aether Pro',
      price: '₹499',
      period: '/month',
      bestFor: 'Developers, creators, and power users.',
      icon: <Sparkles size={24} color="#a855f7" />,
      features: [
        'Advanced AI chat (Faster)',
        'Llama 3.3 70B & Advanced',
        '100MB PDF uploads',
        '500 messages/day',
        'Advanced OCR & Image analysis',
        'Coding assistant & AI debugging',
        'Chat history & Saved convos',
        'Priority support'
      ],
      color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
      buttonText: 'Upgrade to Pro',
      featured: true,
      badge: 'MOST POPULAR'
    },
    {
      name: 'Aether Ultra',
      price: '₹1499',
      period: '/month',
      bestFor: 'Businesses, startups, and teams.',
      icon: <Shield size={24} color="#3b82f6" />,
      features: [
        'Unlimited AI chat',
        'Premium Reasoning Models',
        'Claude & DeepSeek models',
        'AI agents & custom workflows',
        'API access & admin dashboard',
        'Vector database memory',
        'Custom branding & Secure storage',
        'Early access features'
      ],
      color: 'rgba(255, 255, 255, 0.08)',
      buttonText: 'Go Ultra',
      featured: false
    }
  ];

  return (
    <section id="pricing" style={{ padding: '10rem 2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: -1
      }} />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span style={{ 
              background: 'rgba(168, 85, 247, 0.1)', 
              color: 'var(--primary)', 
              padding: '0.5rem 1rem', 
              borderRadius: '99px', 
              fontSize: '0.85rem', 
              fontWeight: 700,
              letterSpacing: '0.1em'
            }}>PRICING PLANS</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: '1.5rem', color: 'white' }}>
              Choose your <span style={{ color: 'var(--primary)' }}>intelligence</span> level
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '1.5rem auto' }}>
              From casual exploration to full-scale business automation. Aether AI scales with your ambition.
            </p>
          </motion.div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2.5rem',
          alignItems: 'stretch'
        }}>
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              style={{
                background: plan.color,
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '3rem 2.5rem',
                border: plan.featured ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: plan.featured ? '0 20px 40px rgba(168, 85, 247, 0.15)' : 'none'
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '99px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {plan.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plan.bestFor}</p>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{plan.period}</span>
              </div>

              <div style={{ flex: 1, marginBottom: '3rem' }}>
                {plan.features.map((feature, j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      background: plan.featured ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginTop: '2px'
                    }}>
                      <Check size={10} color="white" />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%',
                padding: '1.2rem',
                borderRadius: '16px',
                background: plan.featured ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                border: plan.featured ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: plan.featured ? '0 10px 20px rgba(168, 85, 247, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!plan.featured) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                else e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                if (!plan.featured) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                else e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
