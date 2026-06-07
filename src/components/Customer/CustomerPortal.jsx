import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import WelcomeHeader from './WelcomeHeader';
import FolderGrid from './FolderGrid';
import PhotoGrid from './PhotoGrid';
import GalleryLightbox from './GalleryLightbox';
import StickyActionBar from './StickyActionBar';
import SelectionSummaryDrawer from './SelectionSummaryDrawer';
import FinaliseModal from './FinaliseModal';
import SuccessScreen from './SuccessScreen';
import UndoToast from './UndoToast';
import allPhotos, { eventInfo, mockFolders } from '../../data/customerPhotos';

export default function CustomerPortal() {
  const [activeFolderId, setActiveFolderId] = useState(null);
  
  // Global selection state (event-wide)
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [rejectedIds, setRejectedIds]   = useState(new Set());
  
  const [lightboxIdx, setLightboxIdx]   = useState(null);  // null = closed
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  // Undo state
  const [undoToast, setUndoToast]       = useState({ visible: false, message: '', action: null });
  const undoTimerRef = useRef(null);

  // Derive current folder and photos
  const activeFolder = activeFolderId ? mockFolders.find(f => f.id === activeFolderId) : null;
  const currentFolderPhotos = activeFolder ? activeFolder.photos : [];

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

  // ── Reject (toggle) ───────────────────────────────────────────────────────
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
  const handleFinalise = () => {
    setFinaliseOpen(false);
    setSubmitted(true);
    console.log('Finalised:', {
      selected: [...selectedIds],
      rejected: [...rejectedIds],
      event: eventInfo.eventName,
    });
  };

  const reviewedCount = selectedIds.size + rejectedIds.size;

  // ── Submitted view ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SuccessScreen
        coupleName={eventInfo.coupleName}
        selectedCount={selectedIds.size}
        rejectedCount={rejectedIds.size}
        totalCount={eventInfo.totalPhotos}
      />
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
          coupleName={eventInfo.coupleName}
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
              <FolderGrid 
                folders={mockFolders} 
                onSelectFolder={setActiveFolderId} 
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
                onClick={() => setActiveFolderId(null)}
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
            onSelect={handleToggleSelect}
            onReject={handleToggleReject}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Summary drawer (shows all photos globally) */}
      <SelectionSummaryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photos={allPhotos} // we pass the flattened array here so it can find any photo by ID
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
