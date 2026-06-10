import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogIn } from 'lucide-react';
import yogiLogo from '../../assets/headerlogo.png';

export default function MobileNav({ onLogin, onHome }) {
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
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: hidden ? "-100%" : 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 md:hidden safe-top"
    >
      <div className="glass-strong border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo Only */}
          <motion.button
            onClick={onHome}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={yogiLogo} alt="Yogi Digital Studio" className="h-12 w-auto object-contain py-1" />
          </motion.button>


          {/* Login */}
          <motion.button
            onClick={onLogin}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gold/30 text-gold text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-gold/10 transition-all cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            Login
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
