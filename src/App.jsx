import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation/Navigation';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Login/LoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomerPortal from './components/Customer/CustomerPortal';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

function App() {
  const [activeView, setActiveView] = useState('landing');

  const handleNavigateHome = () => {
    setActiveView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setActiveView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role) => {
    // role is 'admin' or 'customer'
    setActiveView(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={handleNavigateHome} />;
      case 'admin':
        return <AdminDashboard />;
      case 'customer':
        return <CustomerPortal />;
      default:
        return <LandingPage />;
    }
  };

  // Nav only on landing; admin/customer have their own internal navigation
  const showNav    = activeView === 'landing';
  // Both admin and customer take full control of the screen
  const isFullPage = activeView === 'admin' || activeView === 'customer';

  return (
    <div className={`${isFullPage ? '' : 'min-h-screen bg-black text-white'}`}>
      {showNav && (
        <Navigation onLogin={handleLogin} onHome={handleNavigateHome} />
      )}

      {isFullPage ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'admin'    && <AdminDashboard />}
            {activeView === 'customer' && <CustomerPortal />}
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            key={activeView}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            {renderView()}
          </motion.main>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
