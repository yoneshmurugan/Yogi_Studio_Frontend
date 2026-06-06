import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 },
  },
};

export default function PhotoCard({ photo, isSelected, onToggle }) {
  return (
    <motion.div
      layout
      variants={item}
      whileHover={{ scale: isSelected ? 0.98 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(photo.id)}
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
    >
      <img
        src={photo.src}
        alt={photo.filename}
        loading="lazy"
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isSelected ? 'scale-[0.98] brightness-75' : 'group-hover:scale-105'}
        `}
      />

      {/* Selection border */}
      <div
        className={`
          absolute inset-0 rounded-xl transition-all duration-300
          ${isSelected
            ? 'border-2 border-gold shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]'
            : 'border-2 border-transparent group-hover:border-white/10'
          }
        `}
      />

      {/* Gold checkmark overlay */}
      <motion.div
        initial={false}
        animate={isSelected ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-lg"
      >
        <Check className="w-4 h-4 text-obsidian" strokeWidth={3} />
      </motion.div>

      {/* Filename label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-white/70 font-mono">{photo.filename}</p>
      </div>
    </motion.div>
  );
}
