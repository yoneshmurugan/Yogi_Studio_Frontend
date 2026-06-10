import { motion, AnimatePresence } from 'framer-motion';
import PortfolioCard from './PortfolioCard';

const container = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function PortfolioGrid({ items, onOpenMedia }) {
  return (
    <motion.div
      layout
      variants={container}
      initial="hidden"
      animate="visible"
      className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <PortfolioCard item={item} onOpenMedia={onOpenMedia} />
          </div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
