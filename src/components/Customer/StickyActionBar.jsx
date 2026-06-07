import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, LayoutGrid, Send, ChevronUp } from 'lucide-react';

export default function StickyActionBar({
  selectedCount, rejectedCount, totalPhotos,
  onOpenSummary, onFinalise,
}) {
  const reviewed = selectedCount + rejectedCount;
  const progress = totalPhotos > 0 ? (reviewed / totalPhotos) * 100 : 0;
  const canFinalise = selectedCount > 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', damping: 22 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="glass-strong border-t border-white/[0.08] mx-auto max-w-4xl rounded-t-2xl">
        <div className="px-5 py-4 md:px-8">

          {/* Progress */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full gold-gradient"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-silver/40 text-xs font-mono whitespace-nowrap">
              {reviewed} / {totalPhotos} reviewed
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            {/* Counts */}
            <div className="flex items-center gap-3 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`s-${selectedCount}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-gold fill-current" />
                  <span className="text-sm font-mono text-gold font-bold">{selectedCount}</span>
                </motion.div>
              </AnimatePresence>

              <span className="text-white/10">·</span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`r-${rejectedCount}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
                  <span className="text-sm font-mono text-red-400 font-bold">{rejectedCount}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Review button */}
            <button
              onClick={onOpenSummary}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm hover:text-white hover:border-white/25 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Finalise button */}
            <motion.button
              onClick={onFinalise}
              disabled={!canFinalise}
              whileHover={canFinalise ? { scale: 1.02 } : {}}
              whileTap={canFinalise ? { scale: 0.97 } : {}}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${canFinalise
                  ? 'gold-gradient text-black shadow-lg shadow-gold/20 cursor-pointer'
                  : 'bg-white/5 text-silver/30 border border-white/5 cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4" />
              <span>Finalise</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
