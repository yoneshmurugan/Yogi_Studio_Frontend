import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { extractAllFaces } from '../../lib/faceApi';

export default function AIPhotoModel() {
  const [eventId, setEventId] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [progress, setProgress] = useState({ current: 0, total: 0, currentAction: '' });
  const [errorMessage, setErrorMessage] = useState('');
  
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Helper to resize image on a canvas
  const processImageToCanvas = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return reject(new Error('Canvas not found'));
        const ctx = canvas.getContext('2d');
        
        // Max dimension 1080p for memory optimization
        const MAX_DIM = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleStartProcessing = async () => {
    if (!eventId) {
      setErrorMessage('Please enter a valid Event ID (e.g. WED_ERODE_2026)');
      return;
    }
    if (files.length === 0) {
      setErrorMessage('Please select photos to process.');
      return;
    }

    setErrorMessage('');
    setStatus('processing');
    setProgress({ current: 0, total: files.length, currentAction: 'Initializing AI Models...' });

    try {
      const faceIndex = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length, currentAction: `Processing ${file.name}...` });
        
        // 1. Resize Image
        const canvas = await processImageToCanvas(file);
        
        // 2. Extract Faces using local GPU
        const faceDescriptors = await extractAllFaces(canvas);
        
        if (faceDescriptors.length > 0) {
          // 3. Upload raw image to Firebase Storage
          setProgress({ current: i + 1, total: files.length, currentAction: `Uploading ${file.name}...` });
          const imageRef = ref(storage, `events/${eventId}/photos/${file.name}`);
          await uploadBytes(imageRef, file);
          const downloadUrl = await getDownloadURL(imageRef);

          // 4. Push to index
          faceIndex.push({
            photoUrl: downloadUrl,
            // Convert Float32Array to standard array for JSON serialization
            faceEmbeddings: faceDescriptors.map(desc => Array.from(desc))
          });
        }
      }

      // 5. Upload unified index JSON to Firebase Storage
      setProgress({ current: files.length, total: files.length, currentAction: 'Finalizing Index...' });
      const indexRef = ref(storage, `events/${eventId}/face_index.json`);
      const indexData = JSON.stringify({ eventId, photos: faceIndex });
      
      await uploadString(indexRef, indexData, 'raw', { contentType: 'application/json' });

      setStatus('complete');
      setProgress({ current: files.length, total: files.length, currentAction: 'Done!' });
      
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred during processing.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-white mb-2 flex items-center">
          <Camera className="w-8 h-8 mr-3 text-gold" />
          AI Photo Model Indexer
        </h1>
        <p className="text-gray-400">
          Upload event photos and process them using your local GPU (RTX 3050).
          This extracts mathematical facial vectors for the Attendee Search feature.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {/* Hidden canvas for image resizing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Event ID</label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="e.g. EVENT_123"
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold transition-colors"
              disabled={status === 'processing'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Select Photos</label>
            <div className="relative group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={status === 'processing'}
              />
              <div className="w-full border-2 border-dashed border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center bg-black group-hover:border-gold transition-colors">
                <Upload className="w-8 h-8 text-gray-500 mb-3 group-hover:text-gold transition-colors" />
                <p className="text-gray-400 text-sm">
                  {files.length > 0 ? `${files.length} photos selected` : 'Drag and drop or click to select photos'}
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-200 text-sm">{errorMessage}</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="p-6 bg-black border border-zinc-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{progress.currentAction}</span>
                <span className="text-gold font-medium">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
              <p className="text-xs text-yellow-500/80 mt-2">
                * Please do not close this tab. Processing is utilizing your local GPU.
              </p>
            </div>
          )}

          {status === 'complete' && (
            <div className="p-6 bg-green-950/30 border border-green-900 rounded-lg flex items-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mr-4" />
              <div>
                <h3 className="text-green-500 font-medium">Processing Complete!</h3>
                <p className="text-green-200/70 text-sm mt-1">
                  Successfully extracted facial vectors and uploaded {files.length} photos.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartProcessing}
              disabled={status === 'processing' || files.length === 0 || !eventId}
              className="bg-gold text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Processing'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
