import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';
import GoldButton from '../ui/GoldButton';

export default function StickyActionBar({ selectedCount, totalPhotos, maxSelections, onSubmit }) {
  const progress = maxSelections > 0 ? (selectedCount / maxSelections) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="glass-strong rounded-t-2xl mx-auto max-w-3xl border-t border-white/8">
        <div className="px-5 py-4 md:px-8 md:py-5">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full gold-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Counter */}
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCount}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-gold" />
                  <span className="text-sm text-white">
                    Selected: <span className="font-mono font-bold text-gold">{selectedCount}</span>
                    <span className="text-silver/40"> / {maxSelections}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Submit */}
            <GoldButton
              onClick={onSubmit}
              disabled={selectedCount === 0}
              className="!px-6 !py-2.5 flex items-center gap-2 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Approvals
            </GoldButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
