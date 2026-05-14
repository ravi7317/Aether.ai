import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Plus, Search, Settings, LogOut, MessageSquare, ShieldCheck, Trash2, Pin, PinOff, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

const Sidebar = ({ onLogout, activeConversationId, onSelectConversation, onNewChat, refreshTrigger, user, showProfile, setShowProfile, showSettings, setShowSettings, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedIds, setPinnedIds] = useState(() => {
    const saved = localStorage.getItem('pinned_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    setIsLoadingHistory(true);
    fetch(`${API_URL}/api/conversations`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        console.log("History fetched from Supabase:", data.length, "items");
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("History fetch error:", err);
        setHistory([]);
      })
      .finally(() => setIsLoadingHistory(false));
  }, [refreshTrigger]);

  useEffect(() => {
    localStorage.setItem('pinned_conversations', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [id, ...prev]
    );
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        setPinnedIds(prev => prev.filter(p => p !== id));
        if (activeConversationId === id) onNewChat();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Date grouping logic
  const groupedHistory = useMemo(() => {
    const groups = {
      Pinned: [],
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      Older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const filtered = history.filter(item => 
      (item.title || "New Chat").toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(item => {
      if (pinnedIds.includes(item.id)) {
        groups.Pinned.push(item);
        return;
      }

      const date = new Date(item.updated_at || item.created_at);
      if (date >= today) groups.Today.push(item);
      else if (date >= yesterday) groups.Yesterday.push(item);
      else if (date >= lastWeek) groups['Last 7 Days'].push(item);
      else groups.Older.push(item);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [history, pinnedIds, searchTerm]);

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} style={{ backgroundColor: 'rgba(168, 85, 247, 0.4)', color: 'white', borderRadius: '2px' }}>{part}</span> 
        : part
    );
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isOpen ? (window.innerWidth <= 768 ? '85%' : '280px') : (window.innerWidth <= 768 ? '0%' : '0px'),
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : (window.innerWidth <= 768 ? -100 : -20),
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`sidebar ${isOpen ? 'open' : ''}`} 
      style={{
        height: '100%',
        background: 'rgba(5, 2, 15, 0.8)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: isOpen ? '1.25rem' : '0',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      <div className="sidebar-top" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="logo" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          color: 'white',
          letterSpacing: '-0.02em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 15px rgba(168, 85, 247, 0.4)', '0 0 25px rgba(168, 85, 247, 0.7)', '0 0 15px rgba(168, 85, 247, 0.4)']
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} color="white" />
            </motion.div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Aether <span style={{ color: 'var(--primary)' }}>AI</span></span>
          </div>
          
          <button onClick={onClose} className="mobile-close-btn" style={{ 
            display: window.innerWidth <= 768 ? 'flex' : 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Trash2 size={20} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNewChat} style={{
          width: '100%',
          padding: '0.8rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: '0.2s',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className="search-box" style={{
          position: 'relative',
          marginBottom: '1.5rem'
        }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.2rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div className="history-section" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden'
        }}>
          <div className="history-list" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '4px'
          }}>
            {isLoadingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Loader2 className="spinning" size={20} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.8rem' }}>Loading history...</div>
              </div>
            ) : groupedHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {searchTerm ? "No matching conversations." : "No conversations found."}
              </div>
            ) : (
              groupedHistory.map(([group, items]) => (
                <div key={group}>
                  <h4 style={{ 
                    fontSize: '0.65rem', 
                    color: 'rgba(255, 255, 255, 0.3)', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    marginBottom: '0.75rem',
                    paddingLeft: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {group === 'Pinned' ? <Pin size={10} /> : <Calendar size={10} />}
                    {group}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`history-item ${activeConversationId === item.id ? 'active' : ''}`}
                        onClick={() => onSelectConversation(item.id)}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: activeConversationId === item.id ? 'white' : 'rgba(255,255,255,0.6)',
                          background: activeConversationId === item.id ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                          transition: '0.2s',
                          position: 'relative',
                          group: 'item'
                        }}
                        onMouseEnter={(e) => {
                          if (activeConversationId !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          if (activeConversationId !== item.id) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <MessageSquare size={14} style={{ opacity: 0.6 }} />
                        <span style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontSize: '0.8rem',
                          flex: 1,
                          fontWeight: activeConversationId === item.id ? 600 : 400
                        }}>
                          {highlightText(item.title || "New Chat", searchTerm)}
                        </span>
                        
                        <div className="item-actions" style={{
                          display: 'flex',
                          gap: '0.4rem'
                        }}>
                          <button 
                            onClick={(e) => togglePin(e, item.id)}
                            style={{ background: 'none', border: 'none', color: pinnedIds.includes(item.id) ? 'var(--primary)' : 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '2px' }}
                            title={pinnedIds.includes(item.id) ? "Unpin" : "Pin"}
                          >
                            {pinnedIds.includes(item.id) ? <PinOff size={12} /> : <Pin size={12} />}
                          </button>
                          <button 
                            onClick={(e) => handleDeleteConversation(e, item.id)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '2px' }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-bottom" style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <button className="sidebar-action" onClick={() => setShowSettings(true)} style={bottomActionStyle}>
          <Settings size={16} />
          <span>Settings</span>
        </button>

        <div className="user-profile" onClick={() => setShowProfile(true)} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: '0.2s',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} 
            alt="User" 
            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || "User Account"}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={10} color="#4ade80" />
              <span>Pro Plan</span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onLogout(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

const bottomActionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
  background: 'transparent',
  border: 'none',
  borderRadius: '10px',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: '0.2s'
};

export default Sidebar;
