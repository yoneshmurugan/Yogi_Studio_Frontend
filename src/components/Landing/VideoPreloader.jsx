import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function VideoPreloader({ videoUrl, fallbackUrl, onComplete }) {
  // Failsafe if no URL is provided, skip immediately
  if (!videoUrl && !fallbackUrl) {
    onComplete();
    return null;
  }

  return createPortal(
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer"
      onClick={onComplete}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        className="w-full h-full object-cover"
      >
        {videoUrl && <source src={videoUrl} type="video/mp4" />}
        {fallbackUrl && <source src={fallbackUrl} type="video/mp4" />}
      </video>
      
      {/* Tap to skip overlay text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-white tracking-[0.3em] text-[10px] md:text-xs uppercase font-light drop-shadow-md"
      >
        Tap to skip
      </motion.div>
    </motion.div>,
    document.body
  );
}
