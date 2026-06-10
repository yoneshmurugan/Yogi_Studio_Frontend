import { motion } from 'framer-motion';
import { Play, BookOpen } from 'lucide-react';

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 },
  },
};

function getYoutubeThumbnail(url) {
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/);
    const id = match ? match[1] : null;
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
}

export default function PortfolioCard({ item, onOpenMedia }) {
  const isVideo = item.category === 'video';
  const isAlbum = item.category === 'e-album';
  const imageUrl = isVideo ? getYoutubeThumbnail(item.url) : (item.url || item.coverUrl);

  const handleClick = () => {
    if (isVideo) {
      onOpenMedia({ type: 'video', url: item.url });
    } else if (isAlbum) {
      onOpenMedia({ type: 'album', photos: item.photos || [], musicUrl: item.musicUrl || null });
    } else {
      onOpenMedia({ type: 'photo', id: item.id });
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariant}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        relative group overflow-hidden rounded-xl cursor-pointer bg-charcoal
      `}
    >
      <img
        src={imageUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        style={{ minHeight: isVideo ? '200px' : '300px' }}
      />

      {/* Media Type Icon Overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-gold/80 group-hover:border-gold transition-colors duration-500">
            <Play className="w-6 h-6 text-white ml-1 fill-white" />
          </div>
        </div>
      )}

      {isAlbum && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-500 group-hover:bg-gold/20 group-hover:border-gold/40 group-hover:scale-110">
            <BookOpen className="w-7 h-7 text-white/80 group-hover:text-gold transition-colors duration-500" />
          </div>
        </div>
      )}

      {/* Gold border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 rounded-xl transition-all duration-500 pointer-events-none z-20" />

      {/* Bottom Gradient & Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
            {isAlbum ? 'E-ALBUM' : item.eventName}
          </p>
          <h3 className="font-serif text-lg text-white">{item.title}</h3>
          {isAlbum && (
            <p className="text-white/40 text-[10px] tracking-widest uppercase mt-2">Click to open album</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
