import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image } from 'lucide-react';

export default function DragDropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      setFileCount((prev) => prev + files.length);
      onFilesAdded?.(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileCount((prev) => prev + files.length);
      onFilesAdded?.(files);
    }
  };

  return (
    <motion.label
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative flex flex-col items-center justify-center gap-4 p-10
        rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${isDragging
          ? 'border-gold bg-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]'
          : 'border-white/10 hover:border-gold/30 bg-charcoal/30'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <motion.div
        animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Upload className={`w-10 h-10 ${isDragging ? 'text-gold' : 'text-silver/50'}`} />
      </motion.div>

      <div className="text-center">
        <p className={`text-sm font-medium ${isDragging ? 'text-gold' : 'text-white'}`}>
          {isDragging ? 'Release to upload' : 'Drag & drop photos here'}
        </p>
        <p className="text-xs text-silver/50 mt-1">or click to browse files</p>
      </div>

      {fileCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-gold"
        >
          <Image className="w-3.5 h-3.5" />
          <span>{fileCount} file{fileCount !== 1 ? 's' : ''} ready</span>
        </motion.div>
      )}
    </motion.label>
  );
}
