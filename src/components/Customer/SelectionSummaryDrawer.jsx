import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, RotateCcw, ChevronDown } from 'lucide-react';

function MiniPhotoCard({ photo, type, onRevert }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative group aspect-square rounded-lg overflow-hidden"
    >
      <img src={photo.url} alt={photo.filename} className="w-full h-full object-cover" />
      {/* Revert overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
        <button
          onClick={() => onRevert(photo.id)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-white text-[10px] hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          Undo
        </button>
      </div>
      {/* State dot */}
      <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center
        ${type === 'selected' ? 'bg-gold' : 'bg-red-500'}`}>
        {type === 'selected'
          ? <Heart className="w-2 h-2 text-black fill-current" />
          : <X className="w-2 h-2 text-white" strokeWidth={3} />
        }
      </div>
    </motion.div>
  );
}

export default function SelectionSummaryDrawer({
  isOpen, onClose,
  photos, selectedIds, rejectedIds,
  onRevertSelect, onRevertReject,
}) {
  const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
  const rejectedPhotos = photos.filter((p) => rejectedIds.has(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[70] glass-strong rounded-t-3xl border-t border-white/10 max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-serif text-xl text-white font-light">Your Review</h3>
                <p className="text-silver/40 text-xs mt-0.5">Tap any photo to undo its selection</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 min-h-0">

              {/* Selected */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-gold fill-current" />
                  <span className="text-gold text-sm font-medium">Selected</span>
                  <span className="text-gold/50 text-xs font-mono ml-auto">{selectedPhotos.length} photos</span>
                </div>
                {selectedPhotos.length > 0 ? (
                  <motion.div layout className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    <AnimatePresence>
                      {selectedPhotos.map((p) => (
                        <MiniPhotoCard key={p.id} photo={p} type="selected" onRevert={onRevertSelect} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="py-6 text-center rounded-xl border border-dashed border-white/10">
                    <p className="text-silver/30 text-xs">No photos selected yet</p>
                  </div>
                )}
              </div>

              {/* Rejected */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-4 h-4 text-red-400" strokeWidth={2.5} />
                  <span className="text-red-400 text-sm font-medium">Rejected</span>
                  <span className="text-red-400/50 text-xs font-mono ml-auto">{rejectedPhotos.length} photos</span>
                </div>
                {rejectedPhotos.length > 0 ? (
                  <motion.div layout className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    <AnimatePresence>
                      {rejectedPhotos.map((p) => (
                        <MiniPhotoCard key={p.id} photo={p} type="rejected" onRevert={onRevertReject} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="py-6 text-center rounded-xl border border-dashed border-white/10">
                    <p className="text-silver/30 text-xs">No photos rejected</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
