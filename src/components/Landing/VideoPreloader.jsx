import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import yogiLogo from '../../assets/Headerlogo.png';

export default function VideoPreloader({ isVisible, videoUrl, fallbackUrl, onComplete }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Failsafe if no URL is provided, skip immediately
  if (!videoUrl && !fallbackUrl) {
    onComplete();
    return null;
  }

  // Update progress based on video currentTime / duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const pct = Math.min((video.currentTime / video.duration) * 100, 100);
        setProgress(pct);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoReady]);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer"
          onClick={onComplete}
        >
          {/* Hidden background video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
        onCanPlay={() => setVideoReady(true)}
        onEnded={onComplete}
        className="absolute inset-0 w-full h-full object-cover"
      >
        {videoUrl && <source src={videoUrl} type="video/mp4" />}
        {fallbackUrl && <source src={fallbackUrl} type="video/mp4" />}
      </video>

      {/* Logo loader — the logo IS the progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
        style={{ width: '220px', height: 'auto' }}
      >
        {/* Ghost logo — always visible at low opacity */}
        <img
          src={yogiLogo}
          alt=""
          className="w-full h-auto object-contain"
          style={{ opacity: 0.15 }}
          draggable={false}
        />

        {/* Revealed logo — clips from left to right based on progress */}
        <img
          src={yogiLogo}
          alt="Yogi Digital Studio"
          className="absolute inset-0 w-full h-auto object-contain"
          style={{
            clipPath: `inset(0 ${100 - progress}% 0 0)`,
            transition: 'clip-path 0.2s ease-out',
          }}
          draggable={false}
        />

        {/* Subtle glow behind the revealed portion */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - progress}% 0 0)`,
            transition: 'clip-path 0.2s ease-out',
            background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.5)',
          }}
        />
      </motion.div>

      {/* Tap to skip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-white tracking-[0.3em] text-[10px] md:text-xs uppercase font-light"
      >
        Tap to skip
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
