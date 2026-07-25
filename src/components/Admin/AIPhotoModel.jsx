import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, Trash2, Folder, ChevronDown, QrCode, Download, X } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { ref, uploadBytes, getDownloadURL, uploadString, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { extractAllFaces } from '../../lib/faceApi';
import appStoreLogo from '../../assets/appstore.png';

export default function AIPhotoModel() {
  const [eventId, setEventId] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [progress, setProgress] = useState({ current: 0, total: 0, currentAction: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [indexedEvents, setIndexedEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [qrEventId, setQrEventId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  // Initialize and update QR code
  useEffect(() => {
    if (qrEventId) {
      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
          width: 300,
          height: 300,
          margin: 15,
          data: `${window.location.origin}/ai-search?eventId=${qrEventId}`,
          image: appStoreLogo,
          dotsOptions: {
            color: "#0a0a0a", // Dark black
            type: "rounded"
          },
          cornersSquareOptions: {
            color: "#d4af37", // Gold outer square
            type: "extra-rounded"
          },
          cornersDotOptions: {
            color: "#0a0a0a", // Dark dot inside gold square
            type: "dot"
          },
          backgroundOptions: {
            color: "#ffffff",
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 6,
            imageSize: 0.35
          }
        });
      } else {
        qrCodeInstance.current.update({
          data: `${window.location.origin}/ai-search?eventId=${qrEventId}`
        });
      }
      
      // Give a tiny delay to ensure the div is rendered
      setTimeout(() => {
        if (qrRef.current) {
          qrRef.current.innerHTML = '';
          qrCodeInstance.current.append(qrRef.current);
        }
      }, 50);
    }
  }, [qrEventId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchIndexedEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const eventsRef = ref(storage, 'events');
      const result = await listAll(eventsRef);
      // folders is a reserved prefix for portfolio
      const validEvents = result.prefixes
        .map(p => p.name)
        .filter(name => name !== 'folders');

      const eventsWithStats = await Promise.all(
        validEvents.map(async (eventName) => {
          try {
            const indexRef = ref(storage, `events/${eventName}/face_index.json`);
            const url = await getDownloadURL(indexRef);
            const res = await fetch(url);
            const data = await res.json();
            
            return {
              id: eventName,
              photoCount: data.photos ? data.photos.length : 0,
              totalSizeBytes: data.totalSizeBytes || null
            };
          } catch (e) {
            return {
              id: eventName,
              photoCount: 0,
              totalSizeBytes: null
            };
          }
        })
      );
      setIndexedEvents(eventsWithStats);
    } catch (err) {
      console.error('Error fetching indexed events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchIndexedEvents();
  }, []);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    
    try {
      // 1. Delete the JSON index
      await deleteObject(ref(storage, `events/${eventToDelete}/face_index.json`)).catch(() => {});
      
      // 2. Delete all photos
      const photosRef = ref(storage, `events/${eventToDelete}/photos`);
      const listResult = await listAll(photosRef).catch(() => ({ items: [] }));
      const deletePromises = listResult.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
      
      // Refresh list
      await fetchIndexedEvents();
    } catch (err) {
      console.error('Error deleting AI event:', err);
      alert('Error deleting event data.');
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Helper to dynamically resize image on an in-memory canvas (allows parallel processing)
  const processImageToCanvas = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas'); // Create unique memory canvas
        const ctx = canvas.getContext('2d');
        
        // Restore to 2048px (4K/DSLR handling) to prevent low-resolution embedding collapse
        // Blurry/downscaled faces produce generic math vectors, leading to false positives.
        const MAX_DIM = 2048;
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
      // 0. Fetch existing index if appending to an existing event
      let existingPhotos = [];
      let existingSizeBytes = 0;
      try {
        const indexRef = ref(storage, `events/${eventId}/face_index.json`);
        const url = await getDownloadURL(indexRef);
        const res = await fetch(url);
        const data = await res.json();
        if (data && Array.isArray(data.photos)) {
          existingPhotos = data.photos;
        }
        if (data && data.totalSizeBytes) {
          existingSizeBytes = data.totalSizeBytes;
        }
      } catch (err) {
        // Doesn't exist yet, which is fine
      }

      const faceIndex = [...existingPhotos];
      let newBytesUploaded = 0;
      let processedCount = 0;

      // Process in parallel batches of 5 photos to max out GPU and Network
      const BATCH_SIZE = 5;
      
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        setProgress({ 
          current: processedCount, 
          total: files.length, 
          currentAction: `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...` 
        });

        // Run entire batch in parallel
        await Promise.all(batch.map(async (file) => {
          // 1. Resize Image
          const canvas = await processImageToCanvas(file);
          
          // 2. Extract Faces using local GPU
          const faceDescriptors = await extractAllFaces(canvas);
          
          if (faceDescriptors.length > 0) {
            // 3. Compress and Upload image to Firebase Storage
            const compressedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const imageRef = ref(storage, `events/${eventId}/photos/${file.name}`);
            const uploadRes = await uploadBytes(imageRef, compressedBlob);
            
            newBytesUploaded += uploadRes.metadata.size;
            const downloadUrl = await getDownloadURL(imageRef);

            // 4. Push to index (thread-safe array push)
            faceIndex.push({
              photoUrl: downloadUrl,
              faceEmbeddings: faceDescriptors.map(desc => Array.from(desc))
            });
          }
          
          processedCount++;
          setProgress({ 
            current: processedCount, 
            total: files.length, 
            currentAction: `Processed ${processedCount} / ${files.length} photos` 
          });
        }));
      }

      // 5. Upload unified index JSON to Firebase Storage
      setProgress({ current: files.length, total: files.length, currentAction: 'Finalizing Index...' });
      const indexRef = ref(storage, `events/${eventId}/face_index.json`);
      const indexData = JSON.stringify({ 
        eventId, 
        photos: faceIndex,
        totalSizeBytes: existingSizeBytes + newBytesUploaded
      });
      
      await uploadString(indexRef, indexData, 'raw', { contentType: 'application/json' });

      setStatus('complete');
      setProgress({ current: files.length, total: files.length, currentAction: 'Done!' });
      fetchIndexedEvents();
      
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
        {/* Hidden canvas for image resizing - must not be display:none for WebGL to read it */}
        <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" style={{ zIndex: -100, top: 0, left: 0 }} />

        <div className="space-y-6">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-400 mb-1">Event ID</label>
            <div className="relative">
              <input
                type="text"
                value={eventId}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setEventId(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="e.g. EVENT_123"
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold transition-colors pr-10"
                disabled={status === 'processing'}
              />
              <button 
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Custom Dropdown */}
            {isDropdownOpen && indexedEvents.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
              >
                <div className="p-1.5">
                  {indexedEvents
                    .filter(ev => ev.id.toLowerCase().includes(eventId.toLowerCase()))
                    .map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        setEventId(event.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors flex flex-col group"
                    >
                      <span className="text-white text-sm font-medium group-hover:text-gold transition-colors">{event.id}</span>
                      <span className="text-xs text-zinc-500">{event.photoCount} photos • {event.totalSizeBytes ? (event.totalSizeBytes / (1024*1024)).toFixed(2) + ' MB' : 'Size N/A'}</span>
                    </button>
                  ))}
                  {indexedEvents.filter(ev => ev.id.toLowerCase().includes(eventId.toLowerCase())).length === 0 && (
                    <div className="px-3 py-4 text-center text-zinc-500 text-sm">
                      No matching events found.<br/>
                      <span className="text-xs">Type to create a new one.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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
              disabled={status === 'processing' || status === 'complete' || files.length === 0 || !eventId}
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

      {/* Indexed Events List */}
      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-medium text-white mb-4 flex items-center">
          <Folder className="w-5 h-5 mr-2 text-gold" />
          Indexed AI Events
        </h2>
        
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading events...
          </div>
        ) : indexedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-black rounded-lg border border-zinc-800">
            No events have been indexed yet.
          </div>
        ) : (
          <div className="space-y-3">
            {indexedEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{event.id}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {event.photoCount} Photos • {event.totalSizeBytes ? (event.totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'Size N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQrEventId(event.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEventToDelete(event.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete AI Index and Photos"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0c0c0c] border border-red-900/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            {/* Warning header background */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-900" />
            
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-950/50 flex items-center justify-center border border-red-900/50 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">Delete AI Event?</h3>
                <p className="text-red-400 text-sm mt-0.5 font-medium">{eventToDelete}</p>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm leading-relaxed mb-6">
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc pl-5 mt-2 text-gray-500 space-y-1">
                <li>All uploaded photos for this event</li>
                <li>The facial vector index (<code className="text-xs bg-zinc-900 px-1 rounded">face_index.json</code>)</li>
                <li>All associated metadata</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/50">
              <button
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Yes, Delete Everything</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal (VIP Pass Theme) */}
      {qrEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-sm relative flex flex-col items-center"
          >
            {/* The VIP Pass Card */}
            <div className="w-full bg-gradient-to-b from-[#151515] to-[#0a0a0a] border border-gold/30 rounded-[32px] p-8 shadow-[0_20px_80px_rgba(255,215,0,0.15)] relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
              
              <button
                onClick={() => setQrEventId(null)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8 relative z-10">
                <h2 className="text-[10px] font-bold text-gold tracking-[0.3em] uppercase mb-2">Scan for Photos</h2>
                <h3 className="text-2xl font-serif text-white tracking-wide">{qrEventId}</h3>
              </div>

              {/* The QR Container */}
              <div className="relative bg-white p-4 rounded-2xl mx-auto w-fit shadow-[0_0_40px_rgba(255,215,0,0.2)]">
                {/* Corner accents */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-gold rounded-tl-xl pointer-events-none" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-gold rounded-tr-xl pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-gold rounded-bl-xl pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-gold rounded-br-xl pointer-events-none" />
                
                <div ref={qrRef} className="w-[200px] h-[200px] flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full" />
              </div>

              <div className="mt-8 text-center relative z-10">
                <p className="text-[11px] text-zinc-500 mb-6 font-medium tracking-[0.1em] uppercase">Powered by Yogi Studio AI</p>
                <button
                  onClick={() => {
                    if (qrCodeInstance.current) {
                      qrCodeInstance.current.download({ name: `${qrEventId}_VIP_QRCode`, extension: "png" });
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-amber-500 hover:opacity-90 text-black font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save QR Code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
