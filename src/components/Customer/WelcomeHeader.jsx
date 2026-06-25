import { motion } from 'framer-motion';
import { Camera, CalendarDays, Package } from 'lucide-react';

export default function WelcomeHeader({ coupleName, eventName, eventDate, eventType, photographerName, package: pkg, totalPhotos, reviewedCount }) {
  const pct = totalPhotos > 0 ? Math.round((reviewedCount / totalPhotos) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center mb-8 md:mb-12 px-4"
    >
      {/* Tag line */}
      <motion.p
        className="text-gold/70 text-[10px] tracking-[0.4em] uppercase mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Your Private Gallery
      </motion.p>

      {/* Main heading */}
      <motion.h1
        className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Welcome,{' '}
        <span className="italic gold-text">{coupleName}</span>
      </motion.h1>

      {/* Event meta pills */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: CalendarDays, label: eventDate ? new Date(eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null },
          { icon: Package, label: eventType },
          { icon: Camera, label: photographerName },
        ].map(({ icon: Icon, label }, idx) => label ? (
          <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/[0.08] text-silver/60 text-xs">
            <Icon className="w-3 h-3" />
            {label}
          </span>
        ) : null)}
      </motion.div>

      {/* Progress ring area */}
      {reviewedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/15 text-xs text-gold/80 mt-2"
        >
          <div className="w-3 h-3 rounded-full gold-gradient animate-pulse" />
          {pct}% reviewed — {totalPhotos - reviewedCount} photos remaining
        </motion.div>
      )}

      {/* Photographer note */}
      <motion.div
        className="mt-6 flex justify-center px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl py-3 px-5 max-w-xl shadow-lg flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          </div>
          <p className="text-silver/90 text-xs sm:text-sm leading-relaxed font-medium">
            <span className="text-white">Tip:</span> Tap any photo for fullscreen view. Double tap to <span className="text-gold">select</span> and swipe up or down to <span className="text-red-400">reject</span>.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
