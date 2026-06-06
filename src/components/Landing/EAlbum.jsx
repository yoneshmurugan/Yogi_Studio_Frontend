/**
 * EAlbum.jsx — Premium HTMLFlipBook E-Album
 * Stack: React + react-pageflip + Tailwind CSS + Lucide React
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HTMLFlipBook from "react-pageflip";
import {
  Play, Pause, Maximize, Minimize,
  Volume2, VolumeX, ChevronLeft, ChevronRight,
  LogOut, Music2, Heart,
} from "lucide-react";

// ──────────────────────────────────────────────────────────
// 1.  ALBUM DATA — Using Yogi Studio local assets
// ──────────────────────────────────────────────────────────
import cover from "../../assets/002.jpg";
import photo1 from "../../assets/01.jpg";
import photo2 from "../../assets/0G1A7726.jpg";
import photo3 from "../../assets/IMG-20240423-WA0045.jpg";
import photo4 from "../../assets/IMG-20240423-WA0055.jpg";
import photo5 from "../../assets/IMG-20240503-WA0019.jpg";
import photo6 from "../../assets/IMG-20240503-WA0021.jpg";
import photo7 from "../../assets/IMG-20240503-WA0022.jpg";
import photo8 from "../../assets/IMG-20240503-WA0027.jpg";

const spreads = [photo1, photo2, photo3, photo4, photo5, photo6, photo7];

// ──────────────────────────────────────────────────────────
// 2.  PAGE COMPONENT
// ──────────────────────────────────────────────────────────
const Page = React.forwardRef((props, ref) => {
  return (
    <div className="bg-[#0a0a0a] overflow-hidden shadow-2xl" ref={ref} data-density={props.density || "soft"}>
      {props.children}
    </div>
  );
});

// ──────────────────────────────────────────────────────────
// 3.  PAGE DOT INDICATOR
// ──────────────────────────────────────────────────────────
function PageDots({ total, current, onGo }) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i} onClick={() => onGo(i)}
          aria-label={`Go to page ${i}`}
          className="rounded-full transition-all duration-300 border-none cursor-pointer"
          style={{
            width:  i === current || i === current - 1 ? 20 : 8,
            height: i === current || i === current - 1 ? 6  : 8,
            borderRadius: i === current || i === current - 1 ? 3 : "50%",
            background: i === current || i === current - 1 ? "#d4af37" : "rgba(255,255,255,.35)",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 4.  CONTROL BAR BUTTON
// ──────────────────────────────────────────────────────────
function Btn({ children, onClick, label, active, disabled, danger }) {
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label={label} title={label}
      style={{
        width: 36, height: 36, borderRadius: 12, border: "none",
        background: active ? "rgba(212,175,55,.35)" : "transparent",
        color: danger ? "rgba(252,165,165,.8)" : active ? "#d4af37" : "rgba(255,255,255,.75)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
        boxShadow: active ? "0 0 14px rgba(212,175,55,.3)" : "none",
        position: "relative",
        flexShrink: 0,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = active ? "rgba(212,175,55,.45)" : "rgba(255,255,255,.15)")}
      onMouseLeave={e => (e.currentTarget.style.background = active ? "rgba(212,175,55,.35)" : "transparent")}
    >
      {children}
      {active && <span style={{ position:"absolute", top:7, right:7, width:5, height:5, borderRadius:"50%", background:"#d4af37" }} />}
    </button>
  );
}

// ──────────────────────────────────────────────────────────
// 5.  GLASSMORPHISM CONTROL BAR
// ──────────────────────────────────────────────────────────
function ControlBar({ current, total, isPlaying, isMuted, isFullscreen, onPrev, onNext, onTogglePlay, onToggleMute, onToggleFullscreen, onExit, onGo }) {
  const barStyle = {
    display: "flex", alignItems: "center", gap: 2,
    padding: "8px 14px", borderRadius: 20,
    background: "rgba(255,255,255,.07)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255,255,255,.14)",
    boxShadow: "0 8px 32px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  };
  const vDiv = <div style={{ width:1, height:20, background:"rgba(255,255,255,.18)", margin:"0 4px", flexShrink:0 }} />;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-50"
    >
      <div className="pointer-events-auto">
        <PageDots total={total} current={current} onGo={onGo} />
      </div>
      <div style={barStyle} className="pointer-events-auto scale-90 md:scale-100 origin-bottom overflow-x-auto max-w-[95vw] hide-scrollbar">
        <Btn onClick={onExit} label="Exit" danger><LogOut size={15} /></Btn>
        {vDiv}
        <Btn onClick={onPrev} label="Previous" disabled={current === 0}><ChevronLeft size={18} /></Btn>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,.65)", letterSpacing:"2px", padding:"0 8px", minWidth:52, textAlign:"center", userSelect:"none" }}>
          {current === 0 || current === total - 1 ? current + 1 : `${current}-${current + 1}`} / {total}
        </span>
        <Btn onClick={onNext} label="Next" disabled={current >= total - 1}><ChevronRight size={18} /></Btn>
        {vDiv}
        <Btn onClick={onTogglePlay} label={isPlaying ? "Pause" : "Play"} active={isPlaying}>
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </Btn>
        <Btn onClick={onToggleMute} label={isMuted ? "Unmute" : "Mute"} active={!isMuted}>
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </Btn>
        <Btn onClick={onToggleFullscreen} label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </Btn>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────
// 6.  FLOATING MUSIC NOTE
// ──────────────────────────────────────────────────────────
function MusicNote({ id, x, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: [0, 0.7, 0], y: -100, scale: [0.5, 1.1, 0.9], rotate: [-10, 15] }}
      transition={{ duration: 2.8, ease: "easeOut" }}
      style={{ position:"absolute", bottom:"15%", left:`${x}%`, pointerEvents:"none", zIndex:50, fontSize:22, color:"rgba(212,175,55,.55)", userSelect:"none" }}
    >
      ♪
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────
// 7.  MAIN E-ALBUM COMPONENT
// ──────────────────────────────────────────────────────────
export default function EAlbum({ onExit }) {
  const [current,        setCurrent]       = useState(0);
  const [isPlaying,      setIsPlaying]     = useState(false);
  const [isMuted,        setIsMuted]       = useState(true);
  const [isFullscreen,   setIsFullscreen]  = useState(false);
  const [showControls,   setShowControls]  = useState(true);
  const [musicNotes,     setMusicNotes]    = useState([]);

  const containerRef    = useRef(null);
  const bookRef         = useRef(null);
  const audioRef        = useRef(null);
  const hideTimerRef    = useRef(null);
  const noteIdRef       = useRef(0);

  // ── Build Pages Array ─────────────────────────
  const pages = [];

  // Front Cover
  pages.push(
    <Page key="cover-front" density="hard">
      <div className="relative w-full h-full overflow-hidden">
        <img src={cover} alt="Cover" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
          <Heart className="w-7 h-7 mb-3 fill-[#d4af37] text-[#d4af37]" style={{ filter: "drop-shadow(0 0 8px #d4af37)" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px,3.5vw,28px)", fontWeight: 700, letterSpacing: "1px", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
            Yogi Digital Studio
          </h1>
          <div className="w-10 h-px bg-[#d4af37]/60 my-3" />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(11px,2vw,16px)", color: "rgba(212,175,55,.85)", letterSpacing: "2px" }}>
            Capturing Moments That Last Forever
          </p>
        </div>
      </div>
    </Page>
  );

  // Spreads
  spreads.forEach((url, i) => {
    // Left half
    pages.push(
      <Page key={`spread-${i}-left`}>
        <div className="w-full h-full border-r border-black/20" style={{ backgroundImage: `url(${url})`, backgroundSize: '200% 100%', backgroundPosition: 'left center' }} />
      </Page>
    );
    // Right half
    pages.push(
      <Page key={`spread-${i}-right`}>
        <div className="w-full h-full border-l border-white/5" style={{ backgroundImage: `url(${url})`, backgroundSize: '200% 100%', backgroundPosition: 'right center' }} />
      </Page>
    );
  });

  // Back Cover
  pages.push(
    <Page key="cover-back" density="hard">
      <div className="relative w-full h-full overflow-hidden">
        <img src={photo8} alt="Back Cover" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
          <Heart className="w-7 h-7 mb-3 fill-[#d4af37] text-[#d4af37]" style={{ filter: "drop-shadow(0 0 8px #d4af37)" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px,3.5vw,28px)", fontWeight: 700, letterSpacing: "1px", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
            The End of the Beginning
          </h1>
          <div className="w-10 h-px bg-[#d4af37]/60 my-3" />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(11px,2vw,16px)", color: "rgba(212,175,55,.85)", letterSpacing: "2px" }}>
            Thank you for celebrating with us
          </p>
        </div>
      </div>
    </Page>
  );

  const total = pages.length;

  // ── Navigate ──────────────────────────────
  const goNext = useCallback(() => {
    if (bookRef.current?.pageFlip()) bookRef.current.pageFlip().flipNext();
  }, []);

  const goPrev = useCallback(() => {
    if (bookRef.current?.pageFlip()) bookRef.current.pageFlip().flipPrev();
  }, []);

  const goTo = useCallback((idx) => {
    if (bookRef.current?.pageFlip()) bookRef.current.pageFlip().flip(idx);
  }, []);

  // ── Auto-hide controls ────────────────────
  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500);
  }, []);
  useEffect(() => { revealControls(); return () => clearTimeout(hideTimerRef.current); }, [current, revealControls]);

  // ── Keyboard ──────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") { goNext(); revealControls(); }
      if (e.key === "ArrowLeft")  { goPrev(); revealControls(); }
      if (e.key === "Escape")     { onExit?.(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev, onExit, revealControls]);

  // ── Auto-play ─────────────────────────────
  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (bookRef.current?.pageFlip()) {
          const flip = bookRef.current.pageFlip();
          if (flip.getCurrentPageIndex() >= total - 2) { // 2 because it shows spreads
            setIsPlaying(false);
          } else {
            flip.flipNext();
          }
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, total]);

  // ── Music ─────────────────────────────────
  const toggleMute = () => {
    setIsMuted(m => {
      const audio = audioRef.current;
      if (audio) {
        if (m) { audio.volume = 0.3; audio.play().catch(() => {}); }
        else   { audio.pause(); }
      }
      if (m) {
        const id = ++noteIdRef.current;
        setMusicNotes(n => [...n, { id, x: 20 + Math.random() * 55 }]);
      }
      return !m;
    });
  };

  const removeNote = useCallback((id) => setMusicNotes(n => n.filter(x => x.id !== id)), []);

  // ── Fullscreen ────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  return (
    <>
      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" preload="none" />

      {/* Root */}
      <div
        ref={containerRef}
        onMouseMove={revealControls}
        style={{
          position:"fixed", inset:0, width:"100%", height:"100vh",
          background:"#0a0a0a",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden", userSelect:"none",
          zIndex: 9999,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 80% 55% at 50% 50%, rgba(212,175,55,.08) 0%, transparent 70%)",
        }} />

        {/* HTMLFlipBook Container */}
        <div className="w-[95vw] md:w-[85vw] max-w-5xl aspect-[3/2] max-h-[75vh] flex items-center justify-center">
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={150}
            maxWidth={1000}
            minHeight={200}
            maxHeight={1533}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={false}
            onFlip={(e) => setCurrent(e.data)}
            ref={bookRef}
            className="shadow-2xl"
          >
            {pages}
          </HTMLFlipBook>
        </div>

        {/* Floating music notes */}
        {musicNotes.map(n => (
          <MusicNote key={n.id} id={n.id} x={n.x} onDone={() => removeNote(n.id)} />
        ))}

        {/* Glassmorphism control bar */}
        <AnimatePresence>
          {showControls && (
            <ControlBar
              current={current} total={total}
              isPlaying={isPlaying} isMuted={isMuted} isFullscreen={isFullscreen}
              onPrev={goPrev} onNext={goNext}
              onTogglePlay={togglePlay} onToggleMute={toggleMute}
              onToggleFullscreen={toggleFullscreen}
              onExit={onExit || (() => {})}
              onGo={goTo}
            />
          )}
        </AnimatePresence>

        {/* Music on pill */}
        <AnimatePresence>
          {!isMuted && (
            <motion.div
              initial={{ opacity:0, scale:.8 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:.8 }}
              style={{
                position:"absolute", bottom:80, right:18, zIndex:30,
                display:"flex", alignItems:"center", gap:6,
                padding:"5px 12px", borderRadius:14,
                background:"rgba(255,255,255,.08)", backdropFilter:"blur(16px)",
                border:"1px solid rgba(255,255,255,.14)",
              }}
            >
              <Music2 size={13} color="#d4af37" />
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:"rgba(255,255,255,.6)", letterSpacing:"1px" }}>Music on</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
