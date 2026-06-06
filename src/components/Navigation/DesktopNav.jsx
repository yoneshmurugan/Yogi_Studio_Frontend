import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogIn } from 'lucide-react';
import yogiLogo from '../../assets/yogi-logo.jpg';

export default function DesktopNav({ onLogin, onHome }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? "-100%" : 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 hidden md:block"
    >
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Brand — Logo + Name */}
          <motion.button
            onClick={onHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src={yogiLogo} alt="Yogi Digital Studio" className="h-9 w-auto" />
            <div className="hidden lg:block">
              <span className="font-serif text-base tracking-wide text-white">Yogi</span>
              <span className="font-serif text-base tracking-wide gold-text ml-1">Digital Studio</span>
            </div>
          </motion.button>

          {/* Login Button */}
          <motion.button
            onClick={onLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-gold/30 text-gold text-xs tracking-[0.15em] uppercase font-medium hover:bg-gold/10 hover:border-gold/50 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
