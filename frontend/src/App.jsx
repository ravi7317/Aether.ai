import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';

function App() {
  // Initialize view based on saved token
  const [view, setView] = useState(() => {
    if (window.location.pathname === '/admin') return 'admin';
    return localStorage.getItem('token') ? 'dashboard' : 'landing';
  });
  const [authMode, setAuthMode] = useState('login');
  const [showBooking, setShowBooking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setView('landing');
  };

  const handleLoginSuccess = () => {
    setView('dashboard');
  };

  const navigateToAuth = (mode) => {
    setAuthMode(mode);
    setView('auth');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setView('landing');
  };

  const navigateToDashboard = () => {
    setView('dashboard');
  };

  const isDashboard = view === 'dashboard';

  return (
    <div className={`app ${isDashboard ? 'dashboard-view' : ''}`}>
      {!isDashboard && <div className="mesh-gradient"></div>}
      {!isDashboard && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.08), transparent 80%)`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      )}
      {!isDashboard && <Navbar 
        isLoggedIn={!!localStorage.getItem('token')}
        onLogin={() => navigateToAuth('login')} 
        onSignup={() => navigateToAuth('signup')} 
        onDashboard={navigateToDashboard}
        onBookDemo={() => setShowBooking(true)}
      />}
      
      <main>
        {view === 'landing' ? (
          <>
            <Hero 
              onGetStarted={() => navigateToAuth('signup')} 
              onTryDemo={() => {
                console.log("Opening Booking Modal...");
                setShowBooking(true);
              }} 
            />
            <Features />
            <Pricing onSelectPlan={() => navigateToAuth('signup')} />
            <Testimonials />
            <CTA onGetStarted={() => navigateToAuth('signup')} />
          </>
        ) : view === 'auth' ? (
          <AuthPage mode={authMode} setMode={setAuthMode} onBack={navigateToHome} onLoginSuccess={navigateToDashboard} />
        ) : view === 'admin' ? (
          <AdminPanel />
        ) : (
          <DashboardPage onLogout={handleLogout} />
        )}
      </main>
      
      {!isDashboard && <Footer />}

      <BookingModal 
        isOpen={showBooking} 
        onClose={() => setShowBooking(false)} 
      />
    </div>
  );
}

export default App;
