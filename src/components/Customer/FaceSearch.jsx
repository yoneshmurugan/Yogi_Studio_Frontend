import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Camera as CameraIcon, Loader2, ArrowLeft, Image as ImageIcon, Search, Download, CheckCircle2, X, Sparkles, Heart, Shield, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { extractSingleFace, detectLiveFaceBox } from '../../lib/faceApi';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { saveAs } from 'file-saver';
import yogiLogo from '../../assets/Headerlogo.png';

/* ═══════════════════════════════════════════════════════════
   VISUAL COMPONENTS
   ═══════════════════════════════════════════════════════════ */

// Orbital ring that spins around the hero icon
function OrbitalRing({ radius, duration, delay, dotSize = 4, color = 'gold' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      className="absolute inset-0 pointer-events-none"
      style={{ width: radius * 2, height: radius * 2, left: `calc(50% - ${radius}px)`, top: `calc(50% - ${radius}px)` }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          background: color === 'gold' ? '#f0c040' : 'rgba(255,255,255,0.3)',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: color === 'gold' ? '0 0 8px rgba(240,192,64,0.6)' : 'none',
        }}
      />
    </motion.div>
  );
}

// Noise texture SVG overlay
function NoiseOverlay() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-[0.03]">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// 3D perspective card
function TiltCard({ children, className, disabled }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [5, -5]);
  const rotateY = useTransform(x, [-150, 150], [-5, 5]);

  const handleMouse = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated scan line
function ScanLine() {
  return (
    <motion.div
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-0 right-0 h-[1px] pointer-events-none z-20"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function FaceSearch() {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [showPostDownloadModal, setShowPostDownloadModal] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);
  
  // Camera Assistant States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMsg, setCameraMsg] = useState("Initializing camera...");
  const [cameraProgress, setCameraProgress] = useState(0); 

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const touchStartX = useRef(0);
  const resultsRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const goodFramesCount = useRef(0);

  // Live Camera tracking Loop
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      let lastTime = 0;
      
      const loop = async (time) => {
        if (!isCameraOpen) return;
        
        if (time - lastTime < 100) { // Limit to ~10 FPS for mobile battery
          requestRef.current = requestAnimationFrame(loop);
          return;
        }
        lastTime = time;
        
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const detection = await detectLiveFaceBox(videoRef.current);
            if (!detection) {
              setCameraMsg("Face not found. Look into the camera.");
              setCameraProgress(0);
              goodFramesCount.current = 0;
            } else {
              const { box, score } = detection;
              const vW = videoRef.current.videoWidth;
              const vH = videoRef.current.videoHeight;
              
              const boxW = (box.width / vW) * 100;
              const boxX = (box.x / vW) * 100 + (boxW/2);
              const boxY = (box.y / vH) * 100 + ((box.height / vH) * 100 / 2);

              let isGood = true;

              if (score < 0.55) { 
                setCameraMsg("Poor lighting or angle. Face the camera clearly."); 
                isGood = false; 
              } else if (boxW < 18) { 
                setCameraMsg("Too far! Move closer for better quality."); 
                isGood = false; 
              } else if (boxW > 60) { 
                setCameraMsg("Too close! Move slightly back."); 
                isGood = false; 
              } else if (Math.abs(boxX - 50) > 15 || Math.abs(boxY - 50) > 18) {
                setCameraMsg("Center your face in the oval."); 
                isGood = false;
              }

              if (isGood) {
                setCameraMsg("Perfect! Hold still...");
                goodFramesCount.current += 1;
                setCameraProgress(Math.min((goodFramesCount.current / 12) * 100, 100)); // ~1.2s
                
                if (goodFramesCount.current >= 12) {
                  // Capture!
                  cancelAnimationFrame(requestRef.current);
                  handleAutoCapture();
                  return;
                }
              } else {
                goodFramesCount.current = 0;
                setCameraProgress(0);
              }
            }
          } catch(e) {}
        }
        requestRef.current = requestAnimationFrame(loop);
      };
      
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        requestRef.current = requestAnimationFrame(loop);
      };
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraOpen]);

  // Auto-scroll to results
  useEffect(() => {
    if (status === 'complete') {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const event = params.get('eventId');
    if (event) setEventId(event);
  }, []);

  // Lightbox keyboard nav
  useEffect(() => {
    if (selectedImageIdx === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedImageIdx(null);
      if (e.key === 'ArrowRight') setSelectedImageIdx(i => Math.min(i + 1, matchedPhotos.length - 1));
      if (e.key === 'ArrowLeft') setSelectedImageIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImageIdx, matchedPhotos.length]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setSelectedImageIdx(i => Math.min(i + 1, matchedPhotos.length - 1));
      else setSelectedImageIdx(i => Math.max(i - 1, 0));
    }
  };

  // ── Remove false positive photo ──
  const removePhoto = (e, idxToRemove) => {
    e.stopPropagation();
    setMatchedPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // ── Download with watermark ──
  const handleDownloadAll = async () => {
    if (matchedPhotos.length === 0) return;
    setDownloadStatus('downloading');
    setDownloadProgress({ current: 0, total: matchedPhotos.length });
    try {
      const applyWatermark = (url) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const wm = new Image();
          wm.src = yogiLogo;
          wm.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const wmW = img.width * 0.15, wmH = wm.height * (wmW / wm.width), pad = img.width * 0.03;
            ctx.globalAlpha = 0.9;
            ctx.drawImage(wm, img.width - wmW - pad, img.height - wmH - pad, wmW, wmH);
            c.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
          };
          wm.onerror = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
            c.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
          };
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
      for (let idx = 0; idx < matchedPhotos.length; idx++) {
        const blob = await applyWatermark(matchedPhotos[idx]);
        if (blob) { saveAs(blob, `${eventId}_YogiStudio_Photo_${idx + 1}.jpg`); await new Promise(r => setTimeout(r, 300)); }
        setDownloadProgress({ current: idx + 1, total: matchedPhotos.length });
      }
      setDownloadStatus('done');
      setHasDownloaded(true);
      setShowPostDownloadModal(true);
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (err) { console.error(err); setDownloadStatus('idle'); }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handleAutoCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Mirror draw for front camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    closeCamera();
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    processImageCapture(dataUrl);
  };

  const triggerCamera = async () => {
    if (!eventId) { setErrorMsg('Please enter an Event Code.'); return; }
    setErrorMsg(''); setStatus('checking'); setMatchedPhotos([]); 

    try {
      // Validate Event exists before opening camera
      await getDownloadURL(ref(storage, `events/${eventId}/face_index.json`));
    } catch (error) {
      setStatus('error');
      setErrorMsg("Event not found. Double-check your Event Code.");
      return;
    }
    
    setStatus('idle');

    try {
      // Request camera without strict dimensions to prevent hardware zooming
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      setCameraMsg("Initializing AI engine...");
      setCameraProgress(0);
      goodFramesCount.current = 0;
      setIsCameraOpen(true);
    } catch (err) {
      console.warn("Camera denied/unavailable. Falling back to native file upload.");
      fileInputRef.current?.click();
    }
  };

  const processImageCapture = async (dataUrl) => {
    try {
      setStatus('analyzing');
      const img = new Image(); img.src = dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      
      // CRITICAL: Yield the main thread so the browser can paint the 'Analyzing' UI 
      // before faceApi locks up the CPU/GPU for a few seconds.
      await new Promise(r => setTimeout(r, 150));
      
      const descriptor = await extractSingleFace(img);
      if (!descriptor) throw new Error("No face detected. Try a clearer, well-lit photo.");
      img.src = '';
      setStatus('fetching');
      let indexUrl;
      try { indexUrl = await getDownloadURL(ref(storage, `events/${eventId}/face_index.json`)); }
      catch { throw new Error("Event not found. Double-check your Event Code."); }
      const payload = { eventId, indexUrl, selfieVector: Array.from(descriptor) };
      
      // By sending as text/plain, we bypass the CORS OPTIONS preflight request entirely.
      // Safari notoriously drops connections if too many OPTIONS requests happen or if it fails to cache them.
      // AWS Lambda JSON.parse() doesn't care about the Content-Type header.
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/match-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) { 
        const d = await response.json().catch(() => ({})); 
        throw new Error(d.message || d.error || 'Something went wrong.'); 
      }
      
      const data = await response.json();
      setMatchedPhotos(data.photos || []);
      setStatus('complete');
    } catch (err) { 
      console.error(err); 
      setStatus('error'); 
      setErrorMsg(`Error: ${err.message}`); 
    }
  };

  const handleFileCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.onerror = rej; r.readAsDataURL(file); });
      await processImageCapture(dataUrl);
    } catch (err) { console.error(err); setStatus('error'); setErrorMsg(err.message || 'Something went wrong.'); }
  };

  // ── Derived state ──
  const steps = [
    { id: 'upload', label: 'Selfie', icon: CameraIcon },
    { id: 'analyze', label: 'Analysing', icon: Sparkles },
    { id: 'search', label: 'Searching', icon: Search },
    { id: 'results', label: 'Found', icon: Heart },
  ];
  const activeStep = status === 'idle' || status === 'error' ? -1 : status === 'capturing' ? 0 : status === 'analyzing' ? 1 : status === 'fetching' ? 2 : status === 'complete' ? 3 : -1;
  const isProcessing = ['checking', 'capturing', 'analyzing', 'fetching'].includes(status);
  const isComplete = status === 'complete';

  // Staggered letter animation for the title
  const titleWord1 = "Find Your";
  const titleWord2 = "Moments";

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#020202] relative overflow-x-hidden">
      {/* ═══ CINEMATIC BACKGROUND (Optimized for Mobile) ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Giant ambient orb top-right */}
        <div
          className="absolute -top-[200px] -right-[200px] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 60%)' }}
        />
        {/* Orb bottom-left */}
        <div
          className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 60%)' }}
        />
        {/* Center pulse */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 60%)' }}
        />

        {/* Architectural grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,215,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,215,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Diagonal architectural lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,215,0,1)" strokeWidth="0.5" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255,215,0,1)" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,215,0,1)" strokeWidth="0.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,215,0,1)" strokeWidth="0.5" />
        </svg>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: [0, -150],
              x: [0, (Math.random() - 0.5) * 80],
            }}
            transition={{ duration: 5 + Math.random() * 4, delay: i * 0.8, repeat: Infinity }}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              left: `${10 + Math.random() * 80}%`,
              top: `${30 + Math.random() * 50}%`,
              background: `radial-gradient(circle, rgba(255,215,0,${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-20 pb-20 px-4 md:px-6 flex flex-col items-center min-h-screen">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="fixed top-5 left-4 md:left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-white transition-all bg-black/60 backdrop-blur-2xl rounded-full px-4 py-2 border border-zinc-800/40 hover:border-gold/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden md:inline">Back</span>
        </motion.button>

        {/* ═══ HERO SECTION ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="w-full max-w-lg mx-auto text-center mb-6 pt-2"
        >
          {/* Orbital icon system */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            {/* Orbit rings */}
            <OrbitalRing radius={52} duration={12} delay={0} dotSize={4} color="gold" />
            <OrbitalRing radius={44} duration={8} delay={1} dotSize={3} color="white" />
            <OrbitalRing radius={60} duration={18} delay={0.5} dotSize={3} color="gold" />
            
            {/* Pulsing halo */}
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-2 bg-gold/20 rounded-2xl blur-md"
            />
            
            {/* Main icon container */}
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
              className="absolute inset-4 bg-[#080808] rounded-2xl flex items-center justify-center border border-gold/20 shadow-[0_0_50px_rgba(255,215,0,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <ScanLine />
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <ScanFaceIcon className="w-10 h-10 text-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Staggered title animation */}
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 tracking-tight leading-tight">
            <span className="block">
              {titleWord1.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
                  className="inline-block"
                  style={{ marginRight: char === ' ' ? '0.3em' : '0' }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
              className="block mt-1"
            >
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-gold to-amber-400">{titleWord2}</span>
                <motion.span
                  animate={{ scaleX: [0, 1, 1, 0], originX: ['0%', '0%', '100%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-gold to-amber-300"
                />
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-gray-600 text-sm md:text-base max-w-[280px] mx-auto leading-relaxed"
          >
            One selfie. Every photo of you. Instantly.
          </motion.p>
        </motion.div>

        {/* ═══ PROGRESS STEPS ═══ */}
        <AnimatePresence>
          {activeStep >= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-xs mx-auto overflow-hidden"
            >
              <div className="flex items-center justify-between">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = idx === activeStep;
                  const isDone = idx < activeStep;
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                      {idx > 0 && <div className="absolute top-4 -left-1/2 right-1/2 h-[1px] bg-zinc-800/60" />}
                      {idx > 0 && isDone && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                          className="absolute top-4 -left-1/2 right-1/2 h-[1px] bg-gold origin-left z-[1]"
                          transition={{ duration: 0.5 }} />
                      )}
                      <motion.div
                        animate={isActive ? { scale: [1, 1.2, 1], boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 25px rgba(255,215,0,0.25)', '0 0 0px rgba(255,215,0,0)'] } : {}}
                        transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isDone ? 'bg-gold text-black' :
                          isActive ? 'bg-gold/15 text-gold border-2 border-gold/50' :
                          'bg-zinc-900/60 text-zinc-700 border border-zinc-800/60'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-3.5 h-3.5" />}
                      </motion.div>
                      <span className={`text-[10px] mt-1.5 font-medium transition-colors duration-500 ${isDone ? 'text-gold' : isActive ? 'text-white' : 'text-zinc-700'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CARD ═══ */}
        <TiltCard className="w-full max-w-lg mx-auto" disabled={isComplete}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          >
            <div className={`relative rounded-[28px] transition-all duration-700 ${isComplete ? 'opacity-50 grayscale-[50%]' : ''}`}>
              {/* Card body */}
              <div className="relative bg-[#0a0a0a] rounded-[28px] p-5 md:p-8 overflow-hidden border border-zinc-800/40">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] to-transparent pointer-events-none rounded-[27px]" />
                <div className="absolute inset-0 rounded-[27px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] pointer-events-none" />
                
                <div className="relative space-y-5">
                  {/* Label */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-2.5 uppercase tracking-[0.25em]">
                      Event Code
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        placeholder="Enter your event code"
                        className="w-full bg-[#050505] border border-zinc-800/60 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-gold/30 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.04),0_0_25px_rgba(255,215,0,0.04)] transition-all placeholder:text-zinc-800 tracking-wide group-hover:border-zinc-700/80"
                        disabled={isProcessing || isComplete}
                      />
                      <AnimatePresence>
                        {eventId && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                              <CheckCircle2 className="w-3 h-3 text-gold" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="p-3.5 bg-red-950/10 border border-red-900/10 rounded-xl text-red-400/70 text-sm flex items-start gap-2.5"
                      >
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input type="file" accept="image/*" capture="user" ref={fileInputRef} className="hidden" onChange={handleFileCapture} />

                  {/* CTA Button */}
                  {!isComplete ? (
                    <motion.button
                      whileTap={!isProcessing ? { scale: 0.97 } : {}}
                      whileHover={!isProcessing && eventId ? { boxShadow: '0 0 40px rgba(255,215,0,0.12)' } : {}}
                      onClick={triggerCamera}
                      disabled={isProcessing || !eventId}
                      className="w-full relative overflow-hidden rounded-xl py-4 font-semibold text-base flex flex-col items-center justify-center disabled:cursor-not-allowed transition-all duration-300 gap-1"
                      style={{
                        background: isProcessing ? 'linear-gradient(135deg, #0a0a0a, #0f0f0f)' : 'linear-gradient(135deg, #b8860b, #d4a017, #f0c040)',
                        color: isProcessing ? '#d4a017' : '#000',
                        opacity: !eventId ? 0.25 : 1,
                        border: isProcessing ? '1px solid rgba(255,215,0,0.12)' : '1px solid rgba(255,215,0,0.3)',
                      }}
                    >
                      {isProcessing && (
                        <motion.div
                          animate={{ x: ['-100%', '250%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-gold/8 to-transparent"
                        />
                      )}
                      <span className="flex items-center gap-2.5">
                        {status === 'idle' || status === 'error' ? (
                          <><CameraIcon className="w-5 h-5" /> Take Selfie & Search</>
                        ) : status === 'checking' ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Event...</>
                        ) : status === 'analyzing' ? (
                          <><Sparkles className="w-5 h-5 text-gold" /> AI Processing Face...</>
                        ) : (
                          <><Sparkles className="w-5 h-5 animate-pulse" /> Finding your moments...</>
                        )}
                      </span>
                      {isProcessing && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-[11px] font-normal">
                          {status === 'checking' ? 'Connecting to Yogi Studio servers...' : 
                           status === 'analyzing' ? 'This may take a moment. Please wait...' : 
                           'Scanning the event gallery...'}
                        </motion.span>
                      )}
                    </motion.button>
                  ) : (
                    /* Completed state - elegant badge */
                    <div className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#050505] border border-zinc-800/40 text-green-500/80">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium text-sm">Search Complete</span>
                    </div>
                  )}

                  {/* Privacy pill */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex justify-center pt-1">
                    <div className="flex items-center gap-1.5 bg-[#050505] rounded-full px-3.5 py-1.5 border border-zinc-900/80">
                      <Shield className="w-3 h-3 text-emerald-600/60" />
                      <span className="text-[10px] text-zinc-600">Your selfie never leaves your device</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </TiltCard>

        {/* ═══ RESULTS ═══ */}
        <AnimatePresence>
          {status === 'complete' && matchedPhotos.length > 0 && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl mx-auto mt-12 scroll-mt-6"
            >
              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-10 origin-center"
              />

              {/* Results header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="relative w-16 h-16 mx-auto mb-5"
                >
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gold/20 rounded-full" />
                  <div className="relative w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center border border-gold/15 shadow-[0_0_30px_rgba(255,215,0,0.06)]">
                    <Heart className="w-7 h-7 text-gold" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-4xl font-serif text-white mb-3 tracking-tight"
                >
                  We found{' '}
                  <motion.span
                    initial={{ opacity: 0, scale: 3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300 font-bold"
                  >{matchedPhotos.length}</motion.span>
                  {' '}of your moments
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-zinc-600 text-sm italic tracking-wide">
                  "Every smile, every glance — preserved forever."
                </motion.p>
              </div>

              {/* Download */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col items-center justify-center mb-8">
                
                <div className="flex items-center gap-2 text-zinc-400 mb-5 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/80 shadow-lg">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-medium tracking-wide">Hint: Remove photos that aren't yours before downloading</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadAll}
                  disabled={downloadStatus !== 'idle'}
                  className="flex items-center gap-2.5 px-7 py-3 bg-[#0a0a0a] backdrop-blur-xl border border-zinc-800/60 rounded-full text-white font-medium hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadStatus === 'downloading' ? (
                    <div className="flex flex-col items-center justify-center w-full min-w-[200px] px-2 py-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        <span className="text-sm font-medium">Downloading {downloadProgress.current} / {downloadProgress.total}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-gold"
                          initial={{ width: 0 }}
                          animate={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                          transition={{ ease: 'linear', duration: 0.2 }}
                        />
                      </div>
                    </div>
                  ) : downloadStatus === 'done' ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-500" /><span>Memories Saved!</span></>
                  ) : (
                    <><Download className="w-4 h-4" /><span>Save All Memories</span></>
                  )}
                </motion.button>
              </motion.div>

              {/* Masonry Gallery */}
              <div className="columns-2 md:columns-3 gap-1.5 md:gap-3">
                {matchedPhotos.map((url, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + idx * 0.07, duration: 0.6, ease: 'easeOut' }}
                    className="mb-1.5 md:mb-3 inline-block w-full rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group relative break-inside-avoid shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                    onClick={() => setSelectedImageIdx(idx)}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="block w-full h-auto object-cover" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {/* Expand icon */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="w-9 h-9 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {/* Remove Photo */}
                    <div className="absolute top-2.5 right-2.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => removePhoto(e, idx)}
                        className="w-8 h-8 bg-black/60 hover:bg-red-500/80 backdrop-blur-xl text-white rounded-full flex items-center justify-center border border-white/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Counter */}
                    <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] bg-black/40 backdrop-blur-xl text-white/60 px-2.5 py-1 rounded-full border border-white/5 font-medium">
                        {idx + 1} / {matchedPhotos.length}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom branding & CTA */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-10 text-center flex flex-col items-center">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent mb-6" />
                
                <AnimatePresence>
                  {hasDownloaded && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      className="mb-8 overflow-hidden"
                    >
                      <h3 className="text-white font-serif text-xl md:text-2xl mb-4">Loved your photos?</h3>
                      <button
                        onClick={() => { window.scrollTo(0,0); navigate('/'); }}
                        className="px-8 py-3 bg-gradient-to-r from-gold to-yellow-600 text-black font-medium rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.2)]"
                      >
                        Discover Yogi Studio
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-zinc-700 text-[11px] tracking-[0.15em] uppercase">Powered by Yogi Studio AI</p>
              </motion.div>
            </motion.div>
          )}

          {/* No matches */}
          {status === 'complete' && matchedPhotos.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg mx-auto mt-10 text-center p-8 md:p-12 bg-[#080808] border border-zinc-900/60 rounded-3xl">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <ImageIcon className="w-7 h-7 text-zinc-700" />
              </div>
              <h3 className="text-lg font-serif text-white mb-2">No matches found</h3>
              <p className="text-gray-700 text-sm leading-relaxed max-w-xs mx-auto">
                We couldn't find your face in this event. Try with better lighting or a clearer photo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ FULLSCREEN LIGHTBOX ═══ */}
      <AnimatePresence>
        {selectedImageIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedImageIdx(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-[60]">
              <span className="text-white/30 text-sm font-medium bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
                {selectedImageIdx + 1} / {matchedPhotos.length}
              </span>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-2.5 bg-white/5 backdrop-blur-sm rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={() => setSelectedImageIdx(null)}>
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Navigation arrows */}
            {selectedImageIdx > 0 && (
              <button className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[60] p-2.5 md:p-3 bg-white/5 backdrop-blur-md rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(i => i - 1); }}>
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            {selectedImageIdx < matchedPhotos.length - 1 && (
              <button className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[60] p-2.5 md:p-3 bg-white/5 backdrop-blur-md rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(i => i + 1); }}>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIdx}
                initial={{ scale: 0.93, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.93, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={5}
                  centerOnInit={true}
                  doubleClick={{ mode: "zoomIn", step: 1.5 }}
                >
                  <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      src={matchedPhotos[selectedImageIdx]}
                      className="max-w-[100vw] max-h-[100vh] object-contain"
                      draggable={false}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ POST-DOWNLOAD MODAL ═══ */}
      <AnimatePresence>
        {showPostDownloadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#111] to-black border border-gold/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
              
              <button 
                onClick={() => setShowPostDownloadModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-6 border border-gold/20 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                <Heart className="w-8 h-8 text-gold" />
              </div>

              <h2 className="text-2xl font-serif text-white mb-3">Loved your photos?</h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Thank you for downloading your memories! Would you like to explore more of our cinematic photography?
              </p>

              <button
                onClick={() => { window.scrollTo(0,0); navigate('/'); }}
                className="w-full py-4 bg-gradient-to-r from-gold to-yellow-600 text-black font-semibold rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] mb-3"
              >
                Discover Yogi Studio
              </button>
              
              <button 
                onClick={() => setShowPostDownloadModal(false)}
                className="text-zinc-500 text-xs font-medium uppercase tracking-widest hover:text-white transition-colors py-2"
              >
                Maybe Later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <img ref={imgRef} className="hidden" alt="" />
      {/* ═══ LIVE AI CAMERA ASSISTANT ═══ */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <h2 className="text-white font-serif text-xl tracking-wide">Yogi Studio AI Selfie Assistant</h2>
              <button onClick={closeCamera} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Video Feed */}
            <div className="relative flex-1 w-full flex items-center justify-center bg-[#050505]">
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                playsInline
                muted
              />
              
              {/* Target Oval Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-[85vw] max-w-[360px] h-[55vh] max-h-[450px] rounded-[150px] border-[3px] border-gold/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative overflow-hidden transition-all duration-300">
                  {/* Scan line effect inside oval */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-[2px] bg-gold/50 z-20 shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                  />
                </div>
                
                {/* Feedback Text */}
                <div className="absolute bottom-[10vh] left-0 right-0 flex flex-col items-center">
                  <motion.div 
                    animate={{ scale: cameraProgress === 100 ? [1, 1.1, 1] : 1 }}
                    className={`px-6 py-3.5 rounded-full backdrop-blur-md border shadow-2xl transition-colors duration-300 ${
                      cameraProgress > 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                      : 'bg-black/60 border-white/20 text-white'
                    }`}
                  >
                    <span className="font-medium text-lg tracking-wide">{cameraMsg}</span>
                  </motion.div>
                  
                  {/* Progress Bar */}
                  <div className="w-48 h-1.5 bg-black/50 rounded-full mt-6 overflow-hidden border border-white/10 relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-400 to-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${cameraProgress}%` }}
                      transition={{ ease: 'linear', duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ScanFaceIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01" /><path d="M15 9h.01" />
    </svg>
  );
}
