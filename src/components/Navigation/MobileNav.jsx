import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { LogIn, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import yogiLogo from '../../assets/Headerlogo.png';

export default function MobileNav({ onLogin, onHome }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    setIsOpen(false);
    const targetId = item.toLowerCase();
    if (targetId === 'testimonials') {
      navigate('/testimonials');
    } else if (targetId === 'contact') {
      navigate('/contact');
    } else {
      if (location.pathname !== '/') {
        navigate(`/#${targetId}`);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView();
      }
    }
  };

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    const isLandingPage = location.pathname === '/';
    const inHeroSection = isLandingPage && latest < 3200;
    
    if (latest > 150) {
      if (inHeroSection) {
        setHidden(true); // Always hide past 150px while in hero section
      } else if (latest > previous) {
        setHidden(true); // Hide when scrolling down outside hero
      } else {
        setHidden(false); // Show when scrolling up outside hero
      }
    } else {
      setHidden(false); // Always show near the top
    }
  });

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: hidden && !isOpen ? "-100%" : 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="glass-strong border-b border-white/5 relative z-50 pt-3 md:pt-4">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-silver hover:text-gold transition-colors p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Logo */}
            <motion.button
              onClick={() => { setIsOpen(false); onHome(); }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={yogiLogo} alt="Yogi Digital Studio" className="h-10 w-auto object-contain py-1" />
            </motion.button>
          </div>

          {/* Login */}
          <motion.button
            onClick={() => { setIsOpen(false); onLogin(); }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gold/30 text-gold text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-gold/10 transition-all cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            Login
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40"
          >
            <div className="flex flex-col py-6 px-6 gap-6">
              {['Portfolio', 'Testimonials', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="text-left text-xl font-serif text-silver/90 hover:text-gold tracking-wide transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
