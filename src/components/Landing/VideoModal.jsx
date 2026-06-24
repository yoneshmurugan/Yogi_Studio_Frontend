import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function VideoModal({ url, onClose }) {
  if (!url) return null;

  // Extract YouTube ID robustly
  let videoId = '';
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/);
    videoId = match ? match[1] : '';
  } catch {
    videoId = '';
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-12" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-8 z-[10000] p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-gold/80 hover:text-black transition-colors backdrop-blur-md"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full bg-black md:rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-0 md:ring-1 ring-white/10 flex flex-col mx-auto"
        style={{ maxWidth: 'min(72rem, calc(100dvh * 16 / 9))' }}
      >
        
        {videoId ? (
          <div className="w-full flex flex-col">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&playsinline=1`}
              title="YouTube video player"
              className="w-full aspect-video border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
            <div className="hidden md:block bg-black/60 p-3 text-center border-t border-white/10">
              <p className="text-silver/70 text-sm">
                Video not playing? Some videos restrict embedding.{' '}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">
                  Watch directly on YouTube ↗
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-silver/50">
            <p>Invalid Video URL</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
