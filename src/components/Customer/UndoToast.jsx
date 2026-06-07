import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function UndoToast({ message, onUndo, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-3 px-5 py-3 rounded-2xl glass-strong border border-white/10 shadow-xl"
        >
          <span className="text-silver/80 text-sm whitespace-nowrap">{message}</span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/15 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
