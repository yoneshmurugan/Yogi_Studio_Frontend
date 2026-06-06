import { motion } from 'framer-motion';

export default function WelcomeHeader({ coupleName, eventDate, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center mb-12"
    >
      <motion.p
        className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Your Gallery
      </motion.p>

      <motion.h1
        className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Welcome, <span className="italic gold-text">{coupleName}</span>
      </motion.h1>

      <motion.p
        className="text-silver/60 text-sm mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {eventDate}
      </motion.p>

      {note && (
        <motion.p
          className="text-silver/40 text-sm max-w-lg mx-auto mt-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {note}
        </motion.p>
      )}
    </motion.div>
  );
}
