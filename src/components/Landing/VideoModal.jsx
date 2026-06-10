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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl aspect-video bg-charcoal rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-gold/80 hover:text-black transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
        
        {videoId ? (
          <div className="w-full h-full flex flex-col">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              className="w-full flex-1 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="bg-black/60 p-3 text-center border-t border-white/10">
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
