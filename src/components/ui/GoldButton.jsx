import { motion } from 'framer-motion';

export default function GoldButton({ children, onClick, disabled = false, className = '', type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative overflow-hidden px-8 py-3.5 rounded-full font-medium text-sm tracking-wider uppercase
        transition-all duration-300 cursor-pointer
        ${disabled
          ? 'bg-ash text-silver/40 cursor-not-allowed'
          : 'gold-gradient text-obsidian hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
        }
        ${className}
      `}
    >
      {!disabled && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 h-full w-full">{children}</span>
    </motion.button>
  );
}
