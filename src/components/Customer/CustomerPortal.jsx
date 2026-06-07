import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeHeader from './WelcomeHeader';
import PhotoGrid from './PhotoGrid';
import GalleryLightbox from './GalleryLightbox';
import StickyActionBar from './StickyActionBar';
import SelectionSummaryDrawer from './SelectionSummaryDrawer';
import FinaliseModal from './FinaliseModal';
import SuccessScreen from './SuccessScreen';
import UndoToast from './UndoToast';
import customerPhotos, { eventInfo } from '../../data/customerPhotos';

export default function CustomerPortal() {
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [rejectedIds, setRejectedIds]   = useState(new Set());
  const [lightboxIdx, setLightboxIdx]   = useState(null);  // null = closed
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [finaliseOpen, setFinaliseOpen] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  // Undo state
  const [undoToast, setUndoToast]       = useState({ visible: false, message: '', action: null });
  const undoTimerRef = useRef(null);

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
    // Here you would fire off an API call with { selectedIds, rejectedIds }
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

        {/* Welcome header */}
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

        {/* Photo grid with filter tabs */}
        <PhotoGrid
          photos={customerPhotos}
          selectedIds={selectedIds}
          rejectedIds={rejectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleReject={handleToggleReject}
          onOpenLightbox={setLightboxIdx}
        />
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <GalleryLightbox
            photos={customerPhotos}
            startIndex={lightboxIdx}
            selectedIds={selectedIds}
            rejectedIds={rejectedIds}
            onSelect={handleToggleSelect}
            onReject={handleToggleReject}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Summary drawer */}
      <SelectionSummaryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        photos={customerPhotos}
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

      {/* Sticky action bar */}
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
