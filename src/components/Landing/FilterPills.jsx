import { motion } from 'framer-motion';

export default function FilterPills({ categories, activeCategory, onFilter }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map((cat) => (
        <motion.button
          key={cat}
          onClick={() => onFilter(cat)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            px-5 py-2 rounded-full text-xs tracking-[0.15em] uppercase font-medium
            transition-all duration-300 cursor-pointer border
            ${activeCategory === cat
              ? 'bg-gold text-obsidian border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
              : 'bg-transparent text-silver border-white/10 hover:border-gold/40 hover:text-white'
            }
          `}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
}
