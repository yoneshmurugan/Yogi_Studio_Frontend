import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    navigate('/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      navigate('/admin/overview');
    } else {
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl');
        navigate(redirectUrl);
      } else {
        navigate('/client');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFullPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/client');
  const showNav = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className={`${isFullPage ? '' : 'min-h-screen bg-black text-white'}`}>
      {showNav && (
        <Navigation onLogin={handleLogin} onHome={handleNavigateHome} />
      )}

      {isFullPage ? (
        <Routes location={location} key={location.pathname.split('/')[1]}>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/client/*" element={<CustomerPortal />} />
        </Routes>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} onBack={handleNavigateHome} />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
