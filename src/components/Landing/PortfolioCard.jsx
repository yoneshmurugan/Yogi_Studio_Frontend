import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 },
  },
};

export default function PortfolioCard({ photo }) {
  const heightClass = {
    tall: 'row-span-2',
    wide: '',
    square: '',
  }[photo.aspect] || '';

  return (
    <motion.div
      layout
      variants={item}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group overflow-hidden rounded-xl cursor-pointer
        ${heightClass}
      `}
    >
      <img
        src={photo.src}
        alt={photo.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        style={{ minHeight: photo.aspect === 'tall' ? '400px' : '200px' }}
      />

      {/* Gold border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 rounded-xl transition-all duration-500" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">{photo.category}</p>
          <h3 className="font-serif text-lg text-white">{photo.title}</h3>
        </div>
      </div>
    </motion.div>
  );
}
