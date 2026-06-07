import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

export default function DragDropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]); // { url, name, size }

  const processFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const newPreviews = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(0) + ' KB',
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    onFilesAdded?.(files);
  }, [onFilesAdded]);

  const handleDrag   = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragIn = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragOut= useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop   = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);
  const handleInput  = (e) => { if (e.target.files?.length) processFiles(e.target.files); };

  const removePreview = (id) => {
    setPreviews((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const totalSize = previews.reduce((sum, p) => sum + parseFloat(p.size), 0).toFixed(0);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <motion.label
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-8
          rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-gold bg-gold/5 shadow-[0_0_30px_rgba(212,175,55,0.08)]'
            : 'border-white/10 hover:border-gold/30 bg-charcoal/20'}
        `}
      >
        <input type="file" multiple accept="image/*,video/*" onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

        <motion.div animate={isDragging ? { scale: 1.15, rotate: 8 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-gold' : 'text-silver/40'}`} />
        </motion.div>

        <div className="text-center">
          <p className={`text-sm font-medium ${isDragging ? 'text-gold' : 'text-white/80'}`}>
            {isDragging ? 'Release to upload' : 'Drag & drop photos here'}
          </p>
          <p className="text-xs text-silver/40 mt-0.5">or click to browse · JPG, PNG, WEBP, MP4</p>
        </div>
      </motion.label>

      {/* Thumbnail grid */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gold">
                <FileImage className="w-3.5 h-3.5" />
                <span>{previews.length} file{previews.length !== 1 ? 's' : ''} · {totalSize} KB total</span>
              </div>
              <button
                onClick={() => { previews.forEach((p) => URL.revokeObjectURL(p.url)); setPreviews([]); }}
                className="text-xs text-silver/40 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
              <AnimatePresence>
                {previews.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-charcoal/50"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); removePreview(p.id); }}
                        className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    {/* file name tooltip on hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-white/70 truncate">{p.name}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
