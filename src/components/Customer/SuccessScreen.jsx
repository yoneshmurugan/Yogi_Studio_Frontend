import { motion } from 'framer-motion';
import { CheckCircle2, Heart, X, Camera, Star } from 'lucide-react';

export default function SuccessScreen({ selectedCount, rejectedCount, totalCount, coupleName }) {
  const stars = Array.from({ length: 5 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="w-24 h-24 rounded-3xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
      >
        <CheckCircle2 className="w-12 h-12 text-gold" />
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-1.5 mb-6"
      >
        {stars.map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.07, type: 'spring' }}
          >
            <Star className="w-5 h-5 text-gold fill-current" />
          </motion.div>
        ))}
      </motion.div>

      {/* Heading */}
      <motion.p
        className="text-gold/70 text-[10px] tracking-[0.4em] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Submitted Successfully
      </motion.p>

      <motion.h1
        className="font-serif text-4xl md:text-5xl text-white font-light mb-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        Thank you,{' '}
        <span className="italic gold-text">{coupleName?.split(' ')[0] ?? 'there'}</span>!
      </motion.h1>

      <motion.p
        className="text-silver/50 text-base max-w-md leading-relaxed mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        Your selections have been sent to Yogi Studio. We'll review your choices and reach out within 2–3 business days with your final album.
      </motion.p>

      {/* Stats */}
      <motion.div
        className="flex gap-4 mb-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div className="glass rounded-2xl px-6 py-4 border border-gold/15">
          <Heart className="w-5 h-5 text-gold fill-current mx-auto mb-2" />
          <p className="text-2xl font-serif text-gold">{selectedCount}</p>
          <p className="text-silver/40 text-xs">Selected</p>
        </div>
        <div className="glass rounded-2xl px-6 py-4 border border-red-500/15">
          <X className="w-5 h-5 text-red-400 mx-auto mb-2" strokeWidth={2.5} />
          <p className="text-2xl font-serif text-red-400">{rejectedCount}</p>
          <p className="text-silver/40 text-xs">Rejected</p>
        </div>
        <div className="glass rounded-2xl px-6 py-4 border border-white/[0.06]">
          <Camera className="w-5 h-5 text-silver/40 mx-auto mb-2" />
          <p className="text-2xl font-serif text-silver/60">{totalCount}</p>
          <p className="text-silver/40 text-xs">Total</p>
        </div>
      </motion.div>

      {/* Studio message */}
      <motion.div
        className="glass rounded-2xl p-6 max-w-sm border border-white/[0.06]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Camera className="w-4 h-4 text-gold/60" />
          <p className="text-gold/70 text-xs tracking-wider uppercase">From Yogi Studio</p>
        </div>
        <p className="text-silver/60 text-sm leading-relaxed italic">
          "It was an absolute honour to capture your special day. We can't wait to deliver your final album."
        </p>
        <p className="text-silver/30 text-xs mt-2">— Yogi Nesh</p>
      </motion.div>
    </motion.div>
  );
}
