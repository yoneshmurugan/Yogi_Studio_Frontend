import { motion } from 'framer-motion';
import { Camera, CalendarDays, Package } from 'lucide-react';

export default function WelcomeHeader({ coupleName, eventName, eventDate, eventType, photographerName, package: pkg, totalPhotos, reviewedCount }) {
  const pct = totalPhotos > 0 ? Math.round((reviewedCount / totalPhotos) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center mb-12"
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
        className="flex flex-wrap items-center justify-center gap-3 mt-4 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: CalendarDays, label: eventDate },
          { icon: Camera, label: photographerName },
          { icon: Package, label: pkg },
        ].map(({ icon: Icon, label }) => label ? (
          <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/[0.08] text-silver/60 text-xs">
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
      <motion.p
        className="text-silver/40 text-sm max-w-xl mx-auto mt-5 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Browse your photos and use ❤️ to select the ones you love and ✕ to reject the ones you don't. Click any photo for fullscreen view.
      </motion.p>
    </motion.div>
  );
}
