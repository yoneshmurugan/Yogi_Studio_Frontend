import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, Calendar, Folder, FileImage, CheckCircle2, ArrowLeft } from 'lucide-react';
import WelcomeHeader from './WelcomeHeader';
import FolderGrid from './FolderGrid';
import PhotoGrid from './PhotoGrid';
import GalleryLightbox from './GalleryLightbox';
import StickyActionBar from './StickyActionBar';
import SelectionSummaryDrawer from './SelectionSummaryDrawer';
import FinaliseModal from './FinaliseModal';
import SuccessScreen from './SuccessScreen';
import UndoToast from './UndoToast';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CustomerPortal() {
  return (
    <Routes>
      <Route path="photoselection" element={<CustomerPortalInner />} />
      <Route path="photoselection/:eventId" element={<CustomerPortalInner />} />
      <Route path="photoselection/:eventId/folder/:folderId" element={<CustomerPortalInner />} />
      <Route path="*" element={<Navigate to="photoselection" replace />} />
    </Routes>
  );
}

function CustomerPortalInner() {
  const navigate = useNavigate();
  const { eventId, folderId } = useParams();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('studio_session_token');

  const { data: eventsData, isLoading, error: queryError } = useQuery({
    queryKey: ['customer', 'events'],
    queryFn: async () => {
      if (!token) throw new Error('No session token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customer/events/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
      return data.events || [];
    },
    enabled: !!token,
  });

  const events = eventsData || [];
  const error = queryError?.message || '';

  const [activeEvent, setActiveEvent] = useState(null);

  const activeFolderId = folderId ? parseInt(folderId, 10) : null;
  
  // Global selection state (event-wide)
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [rejectedIds, setRejectedIds]   = useState(new Set());
  const [comments, setComments]         = useState({});

  // Load from local storage when activeEvent changes
  useEffect(() => {
    if (activeEvent) {
      try {
        const sel = localStorage.getItem(`yogi_sel_${activeEvent.id}`);
        const rej = localStorage.getItem(`yogi_rej_${activeEvent.id}`);
        const com = localStorage.getItem(`yogi_com_${activeEvent.id}`);

        const initialSel = sel ? new Set(JSON.parse(sel)) : new Set();
        const initialRej = rej ? new Set(JSON.parse(rej)) : new Set();
        const initialCom = com ? JSON.parse(com) : {};

        // Merge with activeEvent data in case backend has selections/comments not in local storage
        activeEvent.folders?.forEach(f => {
          f.photos?.forEach(p => {
            if (p.is_selected) initialSel.add(p.id);
            if (p.comment) initialCom[p.id] = p.comment;
          });
        });

        setSelectedIds(initialSel);
        setRejectedIds(initialRej);
        setComments(initialCom);
      } catch (e) {
        console.error("Failed to load local selections", e);
      }
    } else {
      setSelectedIds(new Set());
      setRejectedIds(new Set());
      setComments({});
    }
  }, [activeEvent]);

  // Save to local storage when selections change
  useEffect(() => {
    if (activeEvent) {
      localStorage.setItem(`yogi_sel_${activeEvent.id}`, JSON.stringify([...selectedIds]));
      localStorage.setItem(`yogi_rej_${activeEvent.id}`, JSON.stringify([...rejectedIds]));
      localStorage.setItem(`yogi_com_${activeEvent.id}`, JSON.stringify(comments));
    }
  }, [activeEvent, selectedIds, rejectedIds, comments]);
  
  const [lightboxIdx, setLightboxIdx]   = useState(null);  // null = closed
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  // Undo state
  const [undoToast, setUndoToast]       = useState({ visible: false, message: '', action: null });
  const undoTimerRef = useRef(null);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      sessionStorage.setItem('redirectUrl', window.location.pathname);
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Sync URL eventId with activeEvent
  useEffect(() => {
    if (events.length > 0) {
      if (eventId) {
        const ev = events.find(e => String(e.id) === String(eventId));
        if (ev) setActiveEvent(ev);
      } else if (events.length === 1) {
        // Auto-navigate to the only event
        navigate(`/client/photoselection/${events[0].id}`, { replace: true });
      } else {
        setActiveEvent(null);
      }
    }
  }, [eventId, events, navigate]);

  // Derive current folder and photos
  const folders = activeEvent?.folders || [];
  const allPhotos = folders.flatMap(f => f.photos || []);
  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;
  const currentFolderPhotos = activeFolder ? activeFolder.photos : [];

  const eventInfo = activeEvent ? {
    eventName: activeEvent.eventName,
    coupleName: activeEvent.customerName || "Your Gallery",
    eventDate: activeEvent.eventDate || activeEvent.date,
    eventType: activeEvent.category,
    photographerName: "Yogi Studio",
    package: activeEvent.packageType || activeEvent.package,
    totalPhotos: allPhotos.length,
  } : {};

  // ── Helper: show undo toast for 3 seconds ─────────────────────────────────
  const showUndo = useCallback((message, undoFn) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast({ visible: true, message, action: undoFn });
    undoTimerRef.current = setTimeout(() => {
      setUndoToast({ visible: false, message: '', action: null });
    }, 3000);
  }, []);

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoToast.action?.();
    setUndoToast({ visible: false, message: '', action: null });
  };

  // ── Select (toggle) ───────────────────────────────────────────────────────
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showUndo('Photo unselected', () => setSelectedIds((s) => new Set([...s, id])));
      } else {
        next.add(id);
        // Also remove from rejected if present
        setRejectedIds((r) => { const nr = new Set(r); nr.delete(id); return nr; });
        showUndo('Photo selected', () => setSelectedIds((s) => { const ns = new Set(s); ns.delete(id); return ns; }));
      }
      return next;
    });
  }, [showUndo]);

  // ── Comment (update) ───────────────────────────────────────────────────────
  const handleUpdateComment = useCallback((id, text) => {
    setComments(prev => ({ ...prev, [id]: text }));
  }, []);
  const handleToggleReject = useCallback((id) => {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showUndo('Photo un-rejected', () => setRejectedIds((r) => new Set([...r, id])));
      } else {
        next.add(id);
        // Also remove from selected if present
        setSelectedIds((s) => { const ns = new Set(s); ns.delete(id); return ns; });
        showUndo('Photo rejected', () => setRejectedIds((r) => { const nr = new Set(r); nr.delete(id); return nr; }));
      }
      return next;
    });
  }, [showUndo]);

  // ── Revert helpers for summary drawer ─────────────────────────────────────
  const handleRevertSelect = useCallback((id) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  const handleRevertReject = useCallback((id) => {
    setRejectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  // ── Finalise ──────────────────────────────────────────────────────────────
  const finaliseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customer/events/${activeEvent.id}/submit-selections`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedPhotoIds: [...selectedIds], photoComments: comments })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit selections");
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      setActiveEvent(prev => ({ ...prev, status: 'awaiting_approval' }));
      queryClient.invalidateQueries({ queryKey: ['customer', 'events'] });
    },
    onError: (err) => {
      console.error(err);
      alert("Error submitting selections: " + err.message);
    }
  });

  const handleFinalise = () => {
    setFinaliseOpen(false);
    finaliseMutation.mutate();
  };

  // ── Edit Response ──────────────────────────────────────────────────────────
  const editResponseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customer/events/${activeEvent.id}/revert-selections`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revert selections");
      return data;
    },
    onSuccess: () => {
      setSubmitted(false);
      setActiveEvent(prev => ({ ...prev, status: 'selection_in_progress' }));
      queryClient.invalidateQueries({ queryKey: ['customer', 'events'] });
    },
    onError: (err) => {
      console.error(err);
      alert("Error editing response: " + err.message);
    }
  });

  const handleEditResponse = () => {
    editResponseMutation.mutate();
  };

  const validSelectedCount = [...selectedIds].filter(id => allPhotos.some(p => p.id === id)).length;
  const validRejectedCount = [...rejectedIds].filter(id => allPhotos.some(p => p.id === id)).length;
  const reviewedCount = validSelectedCount + validRejectedCount;

  // ── Loading & Error States ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const isNoEvents = events.length === 0 || (error && error.toLowerCase().includes('no active events'));

  if (isNoEvents) {
    return (
      <div className="min-h-screen bg-[#050505] relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 glass rounded-3xl p-10 max-w-lg w-full border border-gold/10 shadow-2xl shadow-gold/5"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
            <Camera className="w-10 h-10 text-gold" />
          </div>
          
          <h2 className="font-serif text-3xl text-white font-light mb-4">
            Curating Your Memories
          </h2>
          
          <p className="text-silver/60 text-base leading-relaxed mb-8">
            Your gallery is currently being carefully processed and curated by our studio team. 
            We are adding the final touches to ensure every moment looks perfect. 
            We will notify you as soon as your photos are ready to be viewed!
          </p>
          
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-black font-medium tracking-wide uppercase text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Website
          </button>
        </motion.div>
      </div>
    );
  }

  if (error && !isNoEvents) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Event Selection Screen ────────────────────────────────────────────────
  if (events.length > 1 && !activeEvent) {
    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
      }
    };
    const itemVariants = {
      hidden: { opacity: 0, y: 40, scale: 0.95 },
      show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
    };

    return (
      <div className="min-h-screen bg-[#050505] relative flex flex-col items-center justify-start px-4 py-24 sm:py-32 overflow-hidden">
        {/* Dynamic Animated Background Elements */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gold/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-white/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" 
        />
        
        {/* Top Icon / Avatar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }} 
          animate={{ opacity: 1, scale: 1, rotate: 0 }} 
          transition={{ duration: 1, ease: "easeOut", type: "spring" }}
          className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.2)] mb-12 overflow-hidden"
        >
          {(() => {
            let coverImg = null;
            for (const ev of events) {
              for (const f of ev.folders || []) {
                if (f.coverImage) { coverImg = f.coverImage; break; }
                if (!coverImg && f.photos?.[0]?.url) { coverImg = f.photos[0].url; }
              }
              if (coverImg) break;
            }
            return coverImg ? (
              <img src={coverImg} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gold-gradient flex items-center justify-center">
                <Camera className="w-10 h-10 text-black" strokeWidth={1.5} />
              </div>
            );
          })()}
        </motion.div>
        
        {/* Header Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center relative z-10 mb-16 px-4"
        >
          <p className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] tracking-[0.4em] uppercase mb-6 font-semibold shadow-lg backdrop-blur-sm">
            {events.length} Events Found
          </p>
          <h2 className="text-5xl md:text-7xl text-white font-serif font-light mb-6 tracking-wide drop-shadow-2xl">
            Welcome Back
          </h2>
          <p className="text-silver/50 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Select the gallery you would like to view today. Your selection progress is automatically saved across all events.
          </p>
        </motion.div>
        
        {/* Event Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl relative z-10"
        >
          {events.map((ev, i) => {
            const folderCount = ev.folders?.length || 0;
            const photoCount = ev.folders?.reduce((s, f) => s + (f.photos?.length || 0), 0) || 0;
            const isCompleted = ev.status === 'awaiting_approval' || ev.status === 'downloaded';

            return (
              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                key={ev.id} 
                onClick={() => navigate(`/client/photoselection/${ev.id}`)} 
                className="group relative flex flex-col text-left rounded-[2rem] border border-white/10 hover:border-gold/40 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-[0_20px_60px_rgba(212,175,55,0.15)] bg-black/40 backdrop-blur-md"
              >
                {/* Background Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

                <div className="p-8 relative z-10 flex flex-col h-full w-full">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold text-[10px] uppercase tracking-widest font-bold mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                        {ev.category || 'Event'}
                      </span>
                      <h3 className="text-3xl text-white font-serif group-hover:text-gold transition-colors duration-300 leading-tight">
                        {ev.eventName}
                      </h3>
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-gold flex items-center justify-center transition-all duration-500 shrink-0 border border-white/10 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                      <ChevronRight className="w-5 h-5 text-silver/60 group-hover:text-black transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs sm:text-sm text-silver/50 font-medium">
                    <div className="flex items-center gap-4">
                      {ev.date && (
                        <span className="flex items-center gap-1.5 text-white/80">
                          <Calendar className="w-4 h-4 text-gold/70" />
                          {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="hidden sm:flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-silver/40" />
                        {folderCount} Folders
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <FileImage className="w-4 h-4 text-silver/40" />
                          {photoCount} Photos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  }

  // ── Submitted view ────────────────────────────────────────────────────────
  if (submitted || activeEvent.status === 'awaiting_approval' || activeEvent.status === 'approved' || activeEvent.status === 'downloaded') {
    return (
      <SuccessScreen
        coupleName={eventInfo.coupleName}
        selectedCount={selectedIds.size > 0 ? selectedIds.size : null} // Fallback if re-loaded
        rejectedCount={rejectedIds.size}
        totalCount={eventInfo.totalPhotos}
        onEditResponse={handleEditResponse}
      />
    );
  }

  // ── Main Portal ───────────────────────────────────────────────────────────
  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-silver/50 mb-2 text-lg">No active events found.</p>
        <p className="text-silver/30 text-sm">Please contact Yogi Studio if you believe this is an error.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#050505]"
    >
      {/* Subtle top gradient ambient */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none z-0" />

      <div className="relative z-10 px-4 md:px-8 lg:px-16 pt-16 pb-36 max-w-7xl mx-auto">
        
        {/* Event Header is always visible at the top */}
        <WelcomeHeader
          coupleName={eventInfo?.coupleName}
          eventName={eventInfo.eventName}
          eventDate={eventInfo.eventDate}
          eventType={eventInfo.eventType}
          photographerName={eventInfo.photographerName}
          package={eventInfo.package}
          totalPhotos={eventInfo.totalPhotos}
          reviewedCount={reviewedCount}
        />

        <AnimatePresence mode="wait">
          {!activeFolderId ? (
            /* LEVEL 1: Folder Grid */
            <motion.div
              key="folder-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {events.length > 1 && (
                <button
                  onClick={() => navigate(`/client/photoselection`)}
                  className="flex items-center gap-2 text-silver/50 hover:text-white transition-colors mb-6 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Back to Events</span>
                </button>
              )}
              <FolderGrid 
                folders={folders} 
                customerProfileImage={activeEvent.customerProfileImage}
                onSelectFolder={(id) => navigate(`/client/photoselection/${activeEvent.id}/folder/${id}`)} 
              />
            </motion.div>
          ) : (
            /* LEVEL 2: Photo Grid for specific folder */
            <motion.div
              key="photo-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back to folders button */}
              <button
                onClick={() => navigate(`/client/photoselection/${activeEvent.id}`)}
                className="flex items-center gap-2 text-silver/50 hover:text-white transition-colors mb-6 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Back to Folders</span>
              </button>

              <div className="mb-6">
                <h2 className="font-serif text-2xl text-white font-light mb-1">{activeFolder.name}</h2>
                <p className="text-silver/40 text-sm">{currentFolderPhotos.length} Photos in this folder</p>
              </div>

              <PhotoGrid
                photos={currentFolderPhotos}
                selectedIds={selectedIds}
                rejectedIds={rejectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleReject={handleToggleReject}
                onOpenLightbox={setLightboxIdx}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen lightbox (scoped to the currently active folder's photos) */}
      <AnimatePresence>
        {lightboxIdx !== null && activeFolder && (
          <GalleryLightbox
            photos={currentFolderPhotos}
            startIndex={lightboxIdx}
            selectedIds={selectedIds}
            rejectedIds={rejectedIds}
            comments={comments}
            onSelect={handleToggleSelect}
            onReject={handleToggleReject}
            onComment={handleUpdateComment}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Summary drawer (shows all photos globally) */}
      <SelectionSummaryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photos={allPhotos} 
        selectedIds={selectedIds}
        rejectedIds={rejectedIds}
        onRevertSelect={handleRevertSelect}
        onRevertReject={handleRevertReject}
      />

      {/* Finalise modal */}
      <FinaliseModal
        isOpen={finaliseOpen}
        onConfirm={handleFinalise}
        onCancel={() => setFinaliseOpen(false)}
        selectedCount={selectedIds.size}
        rejectedCount={rejectedIds.size}
        totalCount={eventInfo.totalPhotos}
      />

      {/* Undo toast */}
      <UndoToast
        visible={undoToast.visible}
        message={undoToast.message}
        onUndo={handleUndo}
      />

      {/* Sticky action bar (Global) */}
      <StickyActionBar
        selectedCount={selectedIds.size}
        rejectedCount={rejectedIds.size}
        totalPhotos={eventInfo.totalPhotos}
        onOpenSummary={() => setDrawerOpen(true)}
        onFinalise={() => setFinaliseOpen(true)}
      />
    </motion.div>
  );
}
