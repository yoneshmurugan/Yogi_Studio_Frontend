import { motion } from 'framer-motion';
import { Folder, ImageIcon } from 'lucide-react';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function FolderGrid({ folders, onSelectFolder, customerProfileImage }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white font-light">Your Photo Folders</h2>
        <p className="text-silver/40 text-sm">{folders.length} Folders</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {folders.map((folder) => {
          const coverPhoto = folder.photos[0];
          return (
            <motion.button
              key={folder.id}
              variants={item}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectFolder(folder.id)}
              className="text-left group w-full"
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-charcoal/50 border border-white/[0.05] group-hover:border-gold/30 transition-colors">
                {coverPhoto || customerProfileImage ? (
                  <img
                    src={folder.coverImage || customerProfileImage || coverPhoto?.url}
                    alt={folder.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-silver/20">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <p className="text-xs">No photos</p>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Icon indicator */}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <Folder className="w-4 h-4 text-gold" />
                </div>
              </div>

              {/* Folder Details */}
              <h3 className="text-white font-medium text-lg mb-1 group-hover:text-gold transition-colors">{folder.name}</h3>
              <p className="text-silver/50 text-sm flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                {folder.photos.length} Photos
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
