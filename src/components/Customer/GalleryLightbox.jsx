import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  RotateCcw, Keyboard
} from 'lucide-react';

// ── Haptic-like burst animation for select/reject ─────────────────────────────
function ActionBurst({ type }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3.5, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30`}
    >
      <div className={`w-24 h-24 rounded-full ${type === 'select' ? 'bg-gold/20' : 'bg-red-500/20'}`} />
    </motion.div>
  );
}

export default function GalleryLightbox({
  photos, startIndex, selectedIds, rejectedIds,
  onSelect, onReject, onClose,
}) {
  const [index, setIndex]     = useState(startIndex);
  const [burst, setBurst]     = useState(null);   // 'select' | 'reject' | null
  const [zoomed, setZoomed]   = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [dir, setDir]         = useState(0);      // -1 prev, 1 next

  const photo      = photos[index];
  const isSelected = selectedIds.has(photo.id);
  const isRejected = rejectedIds.has(photo.id);
  const total      = photos.length;

  // Hide keyboard hints after 4s
  useEffect(() => {
    const t = setTimeout(() => setShowHints(false), 4000);
    return () => clearTimeout(t);
  }, []);

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

  const triggerBurst = (type) => {
    setBurst(type);
    setTimeout(() => setBurst(null), 500);
  };

  const handleSelect = useCallback(() => {
    onSelect(photo.id);
    triggerBurst('select');
    setTimeout(goNext, 300);
  }, [photo.id, onSelect, goNext]);

  const handleReject = useCallback(() => {
    onReject(photo.id);
    triggerBurst('reject');
    setTimeout(goNext, 300);
  }, [photo.id, onReject, goNext]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') goNext();
      if (e.key === 'ArrowLeft'  || e.key === 'a') goPrev();
      if (e.key === 'Escape')                        onClose();
      if (e.key === 's' || e.key === 'S')            handleSelect();
      if (e.key === 'r' || e.key === 'R')            handleReject();
      if (e.key === 'z' || e.key === 'Z')            setZoomed((z) => !z);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose, handleSelect, handleReject]);

  // Determine photo status border colour
  const borderColor = isSelected
    ? 'ring-2 ring-gold/70'
    : isRejected
    ? 'ring-2 ring-red-500/70'
    : '';

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d) => ({ x: d > 0 ? '-20%' : '20%', opacity: 0, scale: 0.96 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        {/* Counter */}
        <span className="text-silver/60 text-sm font-mono">
          <span className="text-white">{index + 1}</span> / {total}
        </span>

        {/* Status pill */}
        <AnimatePresence mode="wait">
          {isSelected && (
            <motion.div key="sel" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30">
              <Heart className="w-3.5 h-3.5 text-gold fill-current" />
              <span className="text-gold text-xs font-medium">Selected</span>
            </motion.div>
          )}
          {isRejected && (
            <motion.div key="rej" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30">
              <X className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Rejected</span>
            </motion.div>
          )}
          {!isSelected && !isRejected && (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-silver/40 text-xs">Unreviewed</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setZoomed((z) => !z)}
            className="p-2 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Main image area ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">

        {/* Prev arrow */}
        <button onClick={goPrev}
          className="absolute left-4 z-20 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Photo */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={photo.id}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative flex items-center justify-center w-full h-full px-20"
          >
            {/* Burst animation */}
            <AnimatePresence>
              {burst && <ActionBurst key={burst + Date.now()} type={burst} />}
            </AnimatePresence>

            <motion.img
              src={photo.src}
              alt={photo.filename}
              animate={zoomed ? { scale: 1.6 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`max-w-full max-h-full object-contain rounded-xl select-none transition-all duration-300 ${borderColor}`}
              style={{ maxHeight: 'calc(100vh - 220px)' }}
              draggable={false}
            />

            {/* Select/Reject state overlay on image */}
            <AnimatePresence>
              {isSelected && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30">
                  <Heart className="w-5 h-5 text-black fill-current" />
                </motion.div>
              )}
              {isRejected && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button onClick={goNext}
          className="absolute right-4 z-20 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06]">
        <div className="max-w-lg mx-auto">
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mb-4">

            {/* Reject */}
            <motion.button
              onClick={handleReject}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-all
                ${isRejected
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 border border-red-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
            >
              <X className={`w-5 h-5 ${isRejected ? 'text-white' : ''}`} strokeWidth={2.5} />
              {isRejected ? 'Rejected' : 'Reject'}
            </motion.button>

            {/* Skip */}
            <button onClick={goNext}
              className="px-5 py-3 rounded-2xl border border-white/10 text-silver/50 text-sm hover:text-white hover:border-white/20 transition-all">
              Skip →
            </button>

            {/* Select */}
            <motion.button
              onClick={handleSelect}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-all
                ${isSelected
                  ? 'bg-gold text-black shadow-lg shadow-gold/30 border border-gold'
                  : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20'}`}
            >
              <Heart className={`w-5 h-5 ${isSelected ? 'text-black fill-current' : ''}`} />
              {isSelected ? 'Selected ✓' : 'Select'}
            </motion.button>
          </div>

          {/* Thumbnail filmstrip */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar justify-center">
            {photos.map((p, i) => {
              const sel = selectedIds.has(p.id);
              const rej = rejectedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); setZoomed(false); }}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all
                    ${i === index ? 'border-white scale-110' : sel ? 'border-gold' : rej ? 'border-red-500' : 'border-transparent opacity-50 hover:opacity-80'}`}
                >
                  <img src={p.thumb} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Keyboard hints tooltip ── */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-white/10 text-silver/50 text-xs"
          >
            <Keyboard className="w-3 h-3" />
            <span>← → Navigate · S Select · R Reject · Esc Close</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
