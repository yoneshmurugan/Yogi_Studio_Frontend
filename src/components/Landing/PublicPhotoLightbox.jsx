import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export default function PublicPhotoLightbox({ photos, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [dir, setDir] = useState(0);

  const total = photos.length;
  const photo = photos[index];

  const goNext = useCallback(() => {
    setDir(1);
    setIndex((i) => (i + 1) % total);
    setZoomed(false);
  }, [total]);

  const goPrev = useCallback(() => {
    setDir(-1);
    setIndex((i) => (i - 1 + total) % total);
    setZoomed(false);
  }, [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'z') setZoomed((z) => !z);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
    >
      {/* Top Actions */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-2">
        <button
          onClick={() => setZoomed((z) => !z)}
          className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-2xl backdrop-blur-md"
        >
          {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-2xl backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Prev arrow */}
        <button
          onClick={goPrev}
          className="absolute left-4 z-20 w-12 h-12 rounded-full glass-strong hidden sm:flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Photo */}
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div
            key={photo.id}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center w-full h-full"
          >
            <motion.img
              src={photo.url}
              alt={photo.title || 'Portfolio Image'}
              animate={zoomed ? { scale: 1.6 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full object-contain select-none cursor-grab active:cursor-grabbing"
              style={{ maxHeight: '100%', touchAction: 'none' }}
              draggable={false}
              drag={!zoomed}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, { offset }) => {
                if (zoomed) return;
                const swipeX = Math.abs(offset.x);
                if (swipeX > 50) {
                  if (offset.x > 50) goPrev();
                  else if (offset.x < -50) goNext();
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button
          onClick={goNext}
          className="absolute right-4 z-20 w-12 h-12 rounded-full glass-strong hidden sm:flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
