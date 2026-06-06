import { motion, AnimatePresence } from 'framer-motion';
import PortfolioCard from './PortfolioCard';

const container = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function PortfolioGrid({ photos }) {
  return (
    <motion.div
      layout
      variants={container}
      initial="hidden"
      animate="visible"
      className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {photos.map((photo) => (
          <div key={photo.id} className="break-inside-avoid">
            <PortfolioCard photo={photo} />
          </div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
