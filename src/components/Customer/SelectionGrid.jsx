import { motion } from 'framer-motion';
import PhotoCard from './PhotoCard';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function SelectionGrid({ photos, selectedIds, onToggle }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
    >
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedIds.has(photo.id)}
          onToggle={onToggle}
        />
      ))}
    </motion.div>
  );
}
