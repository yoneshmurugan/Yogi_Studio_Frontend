import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Eye } from 'lucide-react';

const FILTERS = [
  { id: 'all',        label: 'All',         icon: null },
  { id: 'selected',   label: 'Selected',    icon: Heart },
  { id: 'rejected',   label: 'Rejected',    icon: X },
  { id: 'unreviewed', label: 'Unreviewed',  icon: Eye },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 18, stiffness: 120 } },
};

function PhotoCard({ photo, isSelected, isRejected, onToggleSelect, onToggleReject, onOpenLightbox }) {
  return (
    <motion.div
      layout
      variants={item}
      onClick={onOpenLightbox}
      className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer select-none"
    >
      {/* Main image — click opens lightbox */}
      <div className="w-full h-full">
        <motion.img
          src={photo.thumb}
          alt={photo.filename}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300
            ${isSelected ? 'brightness-75 scale-[0.98]' : isRejected ? 'brightness-50 grayscale scale-[0.96]' : 'group-hover:scale-105'}
          `}
        />
      </div>

      {/* State ring */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none
        ${isSelected ? 'ring-2 ring-gold shadow-[inset_0_0_20px_rgba(212,175,55,0.12)]'
          : isRejected ? 'ring-2 ring-red-500/70 shadow-[inset_0_0_20px_rgba(239,68,68,0.08)]'
          : 'ring-2 ring-transparent group-hover:ring-white/15'}`}
      />

      {/* State badge top-left */}
      <AnimatePresence>
        {isSelected && (
          <motion.div key="sel" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/40 z-10">
            <Heart className="w-3.5 h-3.5 text-black fill-current" />
          </motion.div>
        )}
        {isRejected && (
          <motion.div key="rej" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 z-10">
            <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover overlay: quick-action buttons */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 gap-2 z-10">
        <div className="flex gap-2">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onToggleReject(); }}
            whileTap={{ scale: 0.88 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${isRejected ? 'bg-red-500 shadow-md' : 'bg-black/60 border border-red-500/50 hover:bg-red-500/30'}`}
          >
            <X className="w-4 h-4 text-red-400" strokeWidth={2.5} />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            whileTap={{ scale: 0.88 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${isSelected ? 'bg-gold shadow-md' : 'bg-black/60 border border-gold/50 hover:bg-gold/30'}`}
          >
            <Heart className={`w-4 h-4 ${isSelected ? 'text-black fill-current' : 'text-gold'}`} />
          </motion.button>
        </div>
        <p className="text-[9px] text-white/50 font-mono">{photo.filename}</p>
      </div>
    </motion.div>
  );
}

export default function PhotoGrid({ photos, selectedIds, rejectedIds, onToggleSelect, onToggleReject, onOpenLightbox }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPhotos = photos.filter((p) => {
    if (activeFilter === 'selected')   return selectedIds.has(p.id);
    if (activeFilter === 'rejected')   return rejectedIds.has(p.id);
    if (activeFilter === 'unreviewed') return !selectedIds.has(p.id) && !rejectedIds.has(p.id);
    return true;
  });

  const counts = {
    all:        photos.length,
    selected:   selectedIds.size,
    rejected:   rejectedIds.size,
    unreviewed: photos.length - selectedIds.size - rejectedIds.size,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {FILTERS.map(({ id, label, icon: Icon }) => {
          const active = activeFilter === id;
          const count  = counts[id];
          return (
            <motion.button
              key={id}
              onClick={() => setActiveFilter(id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border
                ${active
                  ? id === 'selected' ? 'bg-gold/15 border-gold/40 text-gold'
                    : id === 'rejected' ? 'bg-red-500/15 border-red-500/40 text-red-400'
                    : 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/8 text-silver/50 hover:text-white hover:border-white/15'}`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${active && id === 'selected' ? 'fill-current' : ''}`} />}
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                ${active ? 'bg-white/20' : 'bg-white/8'}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredPhotos.length > 0 ? (
          <motion.div
            key={activeFilter}
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isSelected={selectedIds.has(photo.id)}
                isRejected={rejectedIds.has(photo.id)}
                onToggleSelect={() => onToggleSelect(photo.id)}
                onToggleReject={() => onToggleReject(photo.id)}
                onOpenLightbox={() => onOpenLightbox(photos.indexOf(photo))}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {activeFilter === 'selected' && <Heart className="w-10 h-10 text-gold/20 mb-3" />}
            {activeFilter === 'rejected' && <X className="w-10 h-10 text-red-400/20 mb-3" />}
            {activeFilter === 'unreviewed' && <Eye className="w-10 h-10 text-silver/20 mb-3" />}
            <p className="text-silver/40 text-sm">No {activeFilter} photos yet</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
