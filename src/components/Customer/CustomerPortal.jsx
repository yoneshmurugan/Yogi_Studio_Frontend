import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import WelcomeHeader from './WelcomeHeader';
import SelectionGrid from './SelectionGrid';
import StickyActionBar from './StickyActionBar';
import customerPhotos, { eventInfo } from '../../data/customerPhotos';

export default function CustomerPortal() {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSubmit = () => {
    const selectedPhotos = customerPhotos.filter((p) => selectedIds.has(p.id));
    alert(`Submitted ${selectedPhotos.length} photos for approval!\n\nPhotos: ${selectedPhotos.map(p => p.filename).join(', ')}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 md:px-12 lg:px-20 py-24 pb-40 max-w-7xl mx-auto"
    >
      <WelcomeHeader
        coupleName={eventInfo.coupleName}
        eventDate={eventInfo.eventDate}
        note={eventInfo.photographerNote}
      />

      <SelectionGrid
        photos={customerPhotos}
        selectedIds={selectedIds}
        onToggle={toggleSelection}
      />

      <StickyActionBar
        selectedCount={selectedIds.size}
        totalPhotos={eventInfo.totalPhotos}
        maxSelections={eventInfo.maxSelections}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
