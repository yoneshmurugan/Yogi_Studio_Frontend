import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FinaliseModal({ isOpen, onConfirm, onCancel, selectedCount, rejectedCount, totalCount }) {
  const unreviewedCount = totalCount - selectedCount - rejectedCount;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="relative w-full max-w-md glass-strong rounded-3xl p-8 border border-gold/15"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <Send className="w-7 h-7 text-gold" />
          </div>

          <h2 className="font-serif text-2xl text-white text-center font-light mb-2">
            Finalise Your Selection
          </h2>
          <p className="text-silver/50 text-sm text-center mb-8 leading-relaxed">
            Your choices will be sent to the studio. You won't be able to modify them after this.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-2xl p-4 text-center border border-gold/10">
              <Heart className="w-5 h-5 text-gold fill-current mx-auto mb-2" />
              <p className="text-2xl font-serif text-gold font-light">{selectedCount}</p>
              <p className="text-silver/40 text-[10px] uppercase tracking-wider mt-0.5">Selected</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center border border-red-500/10">
              <X className="w-5 h-5 text-red-400 mx-auto mb-2" strokeWidth={2.5} />
              <p className="text-2xl font-serif text-red-400 font-light">{rejectedCount}</p>
              <p className="text-silver/40 text-[10px] uppercase tracking-wider mt-0.5">Rejected</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center border border-white/[0.05]">
              <div className="w-5 h-5 rounded-full border-2 border-silver/30 mx-auto mb-2" />
              <p className="text-2xl font-serif text-silver/60 font-light">{unreviewedCount}</p>
              <p className="text-silver/40 text-[10px] uppercase tracking-wider mt-0.5">Skipped</p>
            </div>
          </div>

          {/* Warning if unreviewed photos */}
          {unreviewedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-5 text-xs text-amber-400/80"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{unreviewedCount} photos haven't been reviewed. They will be marked as skipped.</span>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl border border-white/10 text-silver/60 text-sm hover:border-white/20 hover:text-white transition-all"
            >
              Go Back
            </button>
            <motion.button
              onClick={onConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 rounded-2xl gold-gradient text-black text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
            >
              <Send className="w-4 h-4" />
              Send to Studio
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
