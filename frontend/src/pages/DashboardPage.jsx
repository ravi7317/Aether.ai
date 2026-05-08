import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import { API_URL } from '../config';

const DashboardPage = ({ onLogout }) => {
  const [activeConversationId, setActiveConversationId] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [user, setUser] = React.useState(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [theme, setTheme] = React.useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    fetch(`${API_URL}/api/user/profile`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(err => console.error("User fetch error:", err));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleConversationStarted = (id) => {
    setActiveConversationId(id);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard-container" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#05010D',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Cinematic Background for Dashboard */}
      <div className="dashboard-bg">
        <div className="dash-orb orb-top-right"></div>
        <div className="dash-orb orb-bottom-left"></div>
        <div className="noise-texture"></div>
      </div>

      <Sidebar 
        onLogout={onLogout} 
        activeConversationId={activeConversationId} 
        onSelectConversation={(id) => {
          handleSelectConversation(id);
          if (window.innerWidth <= 768) setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          handleNewChat();
          if (window.innerWidth <= 768) setIsSidebarOpen(false);
        }}
        refreshTrigger={refreshTrigger}
        user={user}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="main-content" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        <ChatInterface 
          onLogout={onLogout} 
          conversationId={activeConversationId} 
          onConversationStarted={handleConversationStarted}
          onOpenProfile={() => setShowProfile(true)}
          onOpenSettings={() => setShowSettings(true)}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          theme={theme}
        />
      </div>

      <style>{`
        .dashboard-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, #090412 0%, #05010D 100%);
          z-index: 0;
          overflow: hidden;
        }
        .dash-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
          pointer-events: none;
        }
        .orb-top-right {
          width: 600px;
          height: 600px;
          background: #8B5CF6;
          top: -200px;
          right: -100px;
        }
        .orb-bottom-left {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          bottom: -100px;
          left: -100px;
        }
        .noise-texture {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* Light Theme Overrides */
        [data-theme='light'] {
          --background: #F8FAFC;
          --card-bg: rgba(255, 255, 255, 0.8);
          --card-border: rgba(0, 0, 0, 0.1);
          --text-muted: #64748B;
        }
        [data-theme='light'] .dashboard-bg {
          background: radial-gradient(circle at 50% 50%, #F1F5F9 0%, #E2E8F0 100%);
        }
        [data-theme='light'] .chat-nav, 
        [data-theme='light'] .sidebar,
        [data-theme='light'] .user-profile {
          background: rgba(255, 255, 255, 0.6) !important;
          border-color: rgba(0, 0, 0, 0.05) !important;
        }
        [data-theme='light'] h1, 
        [data-theme='light'] h2, 
        [data-theme='light'] h4, 
        [data-theme='light'] strong, 
        [data-theme='light'] .sidebar-action:hover,
        [data-theme='light'] .history-item:hover,
        [data-theme='light'] .chat-input-textarea {
          color: #0F172A !important;
        }
        [data-theme='light'] .sidebar-action, 
        [data-theme='light'] .history-item,
        [data-theme='light'] .nav-icon-btn {
          color: #475569 !important;
        }
        [data-theme='light'] .history-item.active {
          background: rgba(168, 85, 247, 0.1);
          color: var(--primary) !important;
        @media (max-width: 768px) {
          .sidebar {
            position: absolute !important;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100 !important;
            width: 85% !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
          }
        }
      `}</style>

      {window.innerWidth <= 768 && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default DashboardPage;
