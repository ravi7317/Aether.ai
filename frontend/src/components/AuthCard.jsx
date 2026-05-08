import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Github, Chrome, Loader2, ArrowRight, X } from 'lucide-react';

const AuthCard = ({ mode, setMode, onLoginSuccess, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login Logic - FastAPI OAuth2 requires form data
        const loginForm = new FormData();
        loginForm.append('username', formData.email);
        loginForm.append('password', formData.password);

        const response = await fetch('http://127.0.0.1:8001/api/auth/login', {
          method: 'POST',
          body: loginForm
        });

        if (!response.ok) throw new Error('Invalid email or password');
        
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        // Signup Logic
        const response = await fetch('http://127.0.0.1:8001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Registration failed');
        }

        setMode('login');
        alert('Account created successfully! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(32px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '28px',
      padding: '3rem',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1)',
      position: 'relative'
    }}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: '0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <X size={18} />
        </button>
      )}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isLogin ? 'Enter your details to sign in' : 'Start your journey with Aether AI'}
        </p>
      </div>

      {error && (
        <div style={{ 
          color: '#f87171', 
          background: 'rgba(239, 68, 68, 0.1)', 
          padding: '0.75rem', 
          borderRadius: '12px', 
          fontSize: '0.85rem', 
          marginBottom: '1.5rem', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {!isLogin && (
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
            <div className="input-field">
              <User className="field-icon" size={18} />
              <input 
                type="text" 
                placeholder="John Doe" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
        )}

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
          <div className="input-field">
            <Mail className="field-icon" size={18} />
            <input 
              type="email" 
              placeholder="name@company.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
            {isLogin && <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot password?</a>}
          </div>
          <div className="input-field">
            <Lock className="field-icon" size={18} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button" 
              className="visibility-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? (
            <Loader2 className="spinning" size={20} />
          ) : (
            <>
              <span>{isLogin ? 'Login' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <div className="social-grid">
        <button className="social-btn">
          <Chrome size={20} />
          <span>Google</span>
        </button>
        <button className="social-btn">
          <Github size={20} />
          <span>GitHub</span>
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setMode(isLogin ? 'signup' : 'login')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
        >
          {isLogin ? 'Create account' : 'Login'}
        </button>
      </div>

      <style>{`
        .input-field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
        }
        .input-field input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.8rem 1rem 0.8rem 3rem;
          color: white;
          outline: none;
          transition: 0.3s;
        }
        .input-field input:focus {
          background: rgba(168, 85, 247, 0.05);
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
        }
        .visibility-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }
        .auth-submit {
          width: 100%;
          background: linear-gradient(90deg, #a855f7, #9333ea);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
        }
        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05rem;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .divider span {
          margin: 0 1rem;
        }
        .social-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.3s;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .social-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AuthCard;
