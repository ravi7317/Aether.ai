import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Sparkles, Trophy, CreditCard, ArrowUpRight, BarChart3, Activity } from 'lucide-react';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, user, onUpgrade }) => {
  if (!isOpen) return null;

  const isFree = user?.plan === 'free';
  const isPro = user?.plan === 'pro';
  const tokenLimit = isFree ? 500 : "Unlimited";
  const tokensUsed = user?.stats?.tokens_estimated || 0;
  const usagePercentage = isFree ? Math.min((tokensUsed / 500) * 100, 100) : 10;

  const allPlans = [
    { name: 'Pro', price: '₹499', features: ['500 msgs/day', 'Faster models'] },
    { name: 'Ultra', price: '₹1499', features: ['Unlimited', 'Best models'] }
  ];

  const visiblePlans = allPlans.filter(p => {
    if (isFree) return true; // Show both
    if (isPro) return p.name === 'Ultra'; // Show only Ultra
    return false; // Ultra users see no upgrade options
  });

  return (
    <div className="profile-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="profile-modal"
      >
        <button className="profile-close" onClick={onClose}><X size={20} /></button>

        <div className="profile-header">
          <div className="profile-avatar-container">
            <img src={user?.avatar} alt="Avatar" className="profile-avatar" />
            <div className={`plan-badge ${user?.plan}`}>
              {user?.plan === 'free' ? <Zap size={10} /> : <ShieldCheck size={10} />}
              {user?.plan?.toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name || 'User Account'}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Activity size={16} color="var(--primary)" />
              <span>Token Usage</span>
            </div>
            <div className="token-usage-bar">
              <div className="usage-progress" style={{ width: `${usagePercentage}%` }}></div>
            </div>
            <div className="usage-details">
              <span>{tokensUsed.toLocaleString()} tokens</span>
              <span className="usage-limit">Limit: {tokenLimit}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Trophy size={16} color="#fbbf24" />
              <span>Rank</span>
            </div>
            <div className="rank-value">{user?.plan === 'free' ? 'Explorer' : 'Elite Member'}</div>
          </div>
        </div>

        <div className="upgrade-section">
          <div className="upgrade-header">
            <Sparkles size={18} color="var(--primary)" />
            <h3>Upgrade Your Experience</h3>
          </div>
          
          <div className="mini-plans">
            {visiblePlans.map((p) => (
              <div key={p.name} className={`mini-plan-card ${user?.plan === p.name.toLowerCase() ? 'active' : ''}`}>
                <div className="mini-plan-info">
                  <h4>{p.name}</h4>
                  <span>{p.price}/mo</span>
                </div>
                <button className="mini-upgrade-btn" onClick={() => onUpgrade(p)}>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="profile-logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}>
          Sign Out
        </button>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
