import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      className={`
        glass rounded-2xl p-6
        transition-colors duration-300
        ${hover ? 'hover:border-gold/20 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
