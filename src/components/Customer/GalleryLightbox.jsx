import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  RotateCcw, Keyboard, MessageSquare, Check, ChevronDown, ChevronUp, Smartphone
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
  photos, startIndex,
  selectedIds, rejectedIds, comments = {},
  onSelect, onReject, onComment,
  onClose
}) {
  const [index, setIndex]     = useState(startIndex);
  const [burst, setBurst]     = useState(null);   // 'select' | 'reject' | null
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showActions, setShowActions] = useState(true);
  const [zoomed, setZoomed]   = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [dir, setDir]         = useState(0);      // -1 prev, 1 next

  // When changing photo, load its comment and close comment box
  useEffect(() => {
    setCommentText(comments[photos[index]?.id] || '');
    setCommentOpen(false);
  }, [index, photos, comments]);

  const photo      = photos[index];
  const isSelected = selectedIds.has(photo.id);
  const isRejected = rejectedIds.has(photo.id);
  const total      = photos.length;

  // Hide hints after 4s on all devices
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

  // Mobile-friendly double tap detection
  const lastTapRef = useRef(0);
  const handleImageTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleSelect();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [handleSelect]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      // Ignore keyboard shortcuts if the user is typing in an input field or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
    >
      {/* ── Floating Top Actions ── */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-2">
        <button onClick={() => setZoomed((z) => !z)}
          className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-2xl backdrop-blur-md">
          {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        </button>
        <button onClick={onClose}
          className="p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-2xl backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ── Main image area ── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">

        {/* Prev arrow */}
        <button onClick={goPrev}
          className="absolute left-4 z-20 w-12 h-12 rounded-full glass-strong hidden sm:flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
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
            {/* Burst animation */}
            <AnimatePresence>
              {burst && <ActionBurst key={burst + Date.now()} type={burst} />}
            </AnimatePresence>

            <motion.img
              src={photo.url}
              alt={photo.filename}
              animate={zoomed ? { scale: 1.6 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`max-w-full max-h-full object-contain rounded-xl select-none cursor-grab active:cursor-grabbing transition-all duration-300 ${borderColor}`}
              style={{ maxHeight: '100%', touchAction: 'none' }}
              draggable={false}
              drag={!zoomed}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onTap={handleImageTap}
              onDragEnd={(e, { offset }) => {
                if (zoomed) return;
                const swipeX = Math.abs(offset.x);
                const swipeY = Math.abs(offset.y);
                
                if (swipeX > swipeY && swipeX > 50) {
                  // Horizontal Swipe
                  if (offset.x > 50) goPrev();
                  else if (offset.x < -50) goNext();
                } else if (swipeY > swipeX && swipeY > 80) {
                  // Vertical Swipe (Up or Down) -> Reject
                  handleReject();
                }
              }}
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
          className="absolute right-4 z-20 w-12 h-12 rounded-full glass-strong hidden sm:flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* ── Floating Bottom Actions ── */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-1.5 sm:gap-4 p-1.5 sm:p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-3xl shadow-2xl"
          >
            {/* Reject */}
            <motion.button
              onClick={handleReject}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all
                ${isRejected
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 border border-red-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
            >
              <X className={`w-4 h-4 sm:w-5 sm:h-5 ${isRejected ? 'text-white' : ''}`} strokeWidth={2.5} />
              {isRejected ? 'Rejected' : 'Reject'}
            </motion.button>

            {/* Skip */}
            <button onClick={goNext}
              className="px-2.5 sm:px-5 py-2 sm:py-3 rounded-2xl border border-white/10 text-silver/50 text-xs sm:text-sm hover:text-white hover:border-white/20 transition-all">
              Skip →
            </button>

            {/* Comment */}
            <div className="relative z-50">
              <button
                disabled={!isSelected}
                onClick={() => setCommentOpen(!commentOpen)}
                title={!isSelected ? "Select the photo first to add a note" : ""}
                className={`px-2.5 sm:px-5 py-2 sm:py-3 rounded-2xl border transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm
                  ${!isSelected
                    ? 'opacity-40 cursor-not-allowed border-white/5 text-silver/40'
                    : comments[photo.id] 
                      ? 'border-blue-400/50 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' 
                      : 'border-white/10 text-silver/50 hover:text-white hover:border-white/20'}`}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{comments[photo.id] ? 'Edit Note' : 'Add Note'}</span>
              </button>

              <AnimatePresence>
                {commentOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-3 rounded-2xl glass-strong border border-white/10 shadow-2xl origin-bottom"
                  >
                    <textarea
                      autoFocus
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a note for the photographer..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-silver/40 focus:outline-none focus:border-gold/50 resize-none h-24 mb-2"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setCommentText(''); onComment && onComment(photo.id, ''); setCommentOpen(false); }}
                        className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-silver/50 hover:bg-white/5 hover:text-white"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => { onComment && onComment(photo.id, commentText); setCommentOpen(false); }}
                        className="flex-1 py-2 rounded-lg bg-gold text-black text-xs font-semibold hover:bg-gold/90"
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Select */}
            <motion.button
              onClick={handleSelect}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all
                ${isSelected
                  ? 'bg-gold text-black shadow-lg shadow-gold/30 border border-gold'
                  : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20'}`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'text-black fill-current' : ''}`} />
              {isSelected ? 'Selected ✓' : 'Select'}
            </motion.button>

            {/* Hide Toggle */}
            <div className="w-px h-8 bg-white/10 mx-0.5 sm:mx-1" />
            <button onClick={() => setShowActions(false)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-silver/50 hover:text-white transition-colors" title="Hide Toolbar">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showActions && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={() => setShowActions(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:bg-white/10 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Keyboard hints tooltip ── */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-2xl md:rounded-full glass-strong border border-white/10 text-silver/50 text-xs md:text-sm font-medium text-center z-50 pointer-events-none w-[90%] md:w-auto"
          >
            <div className="hidden md:flex items-center gap-3 whitespace-nowrap">
              <Keyboard className="w-4 h-4" />
              <span>← → Navigate · S Select · R Reject · Esc Close</span>
            </div>
            <div className="flex md:hidden items-center justify-center gap-2">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>Double tap to select and swipe up or down to reject.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
