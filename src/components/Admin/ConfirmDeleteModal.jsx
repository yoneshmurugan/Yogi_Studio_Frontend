import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({ user, onConfirm, onCancel }) {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-sm glass-strong rounded-2xl p-6 border border-red-500/20"
        >
          {/* Close */}
          <button onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>

          <h2 className="font-serif text-xl text-white font-light mb-2">Delete Client</h2>
          <p className="text-silver/60 text-sm mb-1">
            You are about to permanently delete:
          </p>
          <div className="glass rounded-xl p-3 mb-5 border border-red-500/10">
            <p className="text-white font-medium text-sm">{user.clientName}</p>
            <p className="text-silver/50 text-xs">{user.eventName} · {user.date}</p>
          </div>

          <p className="text-silver/40 text-xs mb-6 leading-relaxed">
            This will permanently remove the client, their event, all uploaded photos, and the access link. <span className="text-red-400">This action cannot be undone.</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onCancel}
              className="py-2.5 rounded-xl border border-white/10 text-silver/70 text-sm hover:border-white/20 hover:text-white transition-all">
              Cancel
            </button>
            <motion.button
              onClick={() => onConfirm(user.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Permanently
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
