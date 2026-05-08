import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, GraduationCap, Target, Send, CheckCircle2, Calendar, BookOpen, Code, FileText } from 'lucide-react';
import { API_URL } from '../config';

const BookingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    goal: ''
  });

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        email: '',
        university: '',
        goal: ''
      });
    }
  }, [isOpen]);

  const goals = [
    { id: 'prep', label: 'Exam Preparation', icon: <BookOpen size={20} /> },
    { id: 'code', label: 'Coding Projects', icon: <Code size={20} /> },
    { id: 'research', label: 'Research Papers', icon: <FileText size={20} /> },
    { id: 'resume', label: 'Resume & Jobs', icon: <GraduationCap size={20} /> }
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleBooking = async () => {
    try {
      const response = await fetch(`${API_URL}/api/demo-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStep(3);
      } else {
        alert("Failed to book demo. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error connecting to server.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 2, 15, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          padding: '3rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1)'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: 'rgba(168, 85, 247, 0.1)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <GraduationCap size={24} color="#a855f7" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Student Demo</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Let's customize your Aether AI experience.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Send size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>University / College</label>
                  <div style={{ position: 'relative' }}>
                    <Target size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input 
                      type="text" 
                      placeholder="Where do you study?"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleNext}
                  disabled={!formData.name || !formData.email || !formData.university}
                  style={{
                    ...btnStyle,
                    opacity: (!formData.name || !formData.email || !formData.university) ? 0.5 : 1,
                    marginTop: '1rem'
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>What's your goal?</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Select what you want to achieve with Aether.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    style={{
                      background: formData.goal === g.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: formData.goal === g.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      color: formData.goal === g.id ? 'white' : 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {g.icon}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{g.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleBack} style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Back</button>
                <button 
                  onClick={handleBooking}
                  disabled={!formData.goal}
                  style={{ ...btnStyle, opacity: !formData.goal ? 0.5 : 1 }}
                >
                  Book Demo
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'rgba(39, 201, 63, 0.1)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  border: '1px solid rgba(39, 201, 63, 0.2)'
                }}
              >
                <CheckCircle2 size={40} color="#27c93f" />
              </motion.div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Demo Reserved!</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                Awesome, {formData.name.split(' ')[0]}! We've sent a calendar invite to your inbox. Get ready to supercharge your studies at {formData.university}.
              </p>
              <button onClick={onClose} style={btnStyle}>Return to Home</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  transition: '0.2s'
};

const btnStyle = {
  flex: 1,
  padding: '0.9rem',
  background: 'var(--primary)',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  transition: '0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem'
};

export default BookingModal;
