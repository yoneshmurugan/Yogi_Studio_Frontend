import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Film, BookOpen, Plus, Trash2,
  Eye, EyeOff, Upload, Link2, X, Loader2
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PLACEHOLDER_COLORS = [
  'from-gold/20 to-gold/5', 'from-purple-500/20 to-purple-500/5',
  'from-blue-500/20 to-blue-500/5', 'from-emerald-500/20 to-emerald-500/5',
  'from-rose-500/20 to-rose-500/5', 'from-amber-500/20 to-amber-500/5',
];

function getYoutubeThumbnail(url) {
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/);
    const id = match ? match[1] : null;
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
}

function TabBtn({ id, label, icon: Icon, active, onClick, count }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
        ${active ? 'bg-gold/10 text-gold border border-gold/30' : 'text-silver/50 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-gold/20 text-gold' : 'bg-white/8 text-silver/50'}`}>{count}</span>
    </button>
  );
}

const EVENT_CATEGORIES = [
  'Wedding',
  'Pre-Wedding',
  'Engagement',
  'Maternity',
  'Baby Shower',
  'Birthday',
  'Corporate',
  'General'
];

// ── Photos Tab ────────────────────────────────────────────────────────────────
function PhotosTab({ items, onAdd, onDelete, setGlobalStatus }) {
  const photos = items.filter(i => i.category === 'photo');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ eventName: EVENT_CATEGORIES[0], title: '', file: null });
  const fileRef = useRef();

  const handleAdd = async () => {
    if (!form.eventName || !form.title || !form.file) return alert("Please fill all fields and select an image.");
    setLoading(true);
    setGlobalStatus("Compressing & Uploading photo...");
    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(form.file, options);
      
      const safeName = form.file.name.replace(/\s+/g, '_');
      const storageRef = ref(storage, `portfolio/photos/${Date.now()}_${safeName}`);
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);

      await onAdd({ category: 'photo', eventName: form.eventName, title: form.title, url }, setLoading);
      setAdding(false);
      setForm({ eventName: EVENT_CATEGORIES[0], title: '', file: null });
    } catch (e) {
      console.error(e);
      alert("Error uploading photo: " + e.message);
    } finally {
      setLoading(false);
      setGlobalStatus(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{photos.length} photos</p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="glass rounded-xl p-4 space-y-4 border border-gold/15">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40">
                  {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-charcoal text-white">{cat}</option>)}
                </select>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Photo Title" className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
              </div>
              <div className="flex items-center gap-3">
                <input type="file" ref={fileRef} accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-silver/50 hover:border-gold/50 hover:text-gold transition-colors text-sm">
                  {form.file ? form.file.name : "Select Image"}
                </button>
                <button onClick={handleAdd} disabled={loading} className="px-5 py-2 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light disabled:opacity-50 flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                </button>
                <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-silver/40 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div key={photo.id} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="group relative aspect-square rounded-xl overflow-hidden bg-charcoal">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-gold text-xs font-semibold uppercase">{photo.eventName}</p>
                <p className="text-white text-sm truncate">{photo.title}</p>
              </div>
              <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDelete(photo.id, photo.url)} className="p-1.5 rounded-lg bg-red-500/80 text-white md:bg-red-500/20 md:text-red-400 hover:bg-red-500/40 backdrop-blur-md">
                  <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── E-Albums Tab ──────────────────────────────────────────────────────────────
function AlbumsTab({ items, onAdd, onDelete, setGlobalStatus }) {
  const albums = items.filter(i => i.category === 'e-album');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ eventName: EVENT_CATEGORIES[0], title: '', files: [], musicFile: null });
  const fileRef = useRef();
  const musicRef = useRef();

  const handleAdd = async () => {
    if (!form.eventName || !form.title || form.files.length === 0) return alert("Please fill all fields and select at least one image.");
    setLoading(true);
    try {
      const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1920, useWebWorker: true };
      const uploadedPhotos = [];
      let coverUrl = '';

      for (let i = 0; i < form.files.length; i++) {
        setGlobalStatus(`Compressing & Uploading ${i + 1} of ${form.files.length}...`);
        const file = form.files[i];
        const compressedFile = await imageCompression(file, options);
        const safeName = file.name.replace(/\s+/g, '_');
        const storageRef = ref(storage, `portfolio/albums/${Date.now()}_${i}_${safeName}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadedPhotos.push({ id: Date.now() + i, url });
        if (i === 0) coverUrl = url;
      }

      let musicUrl = '';
      if (form.musicFile) {
        setGlobalStatus("Uploading audio track...");
        const audioStorageRef = ref(storage, `portfolio/music/${Date.now()}_${form.musicFile.name}`);
        await uploadBytes(audioStorageRef, form.musicFile);
        musicUrl = await getDownloadURL(audioStorageRef);
      }

      setGlobalStatus("Saving album to database...");
      await onAdd({ category: 'e-album', eventName: form.eventName, title: form.title, coverUrl, photos: uploadedPhotos, musicUrl }, setLoading);
      setAdding(false);
      setForm({ eventName: EVENT_CATEGORIES[0], title: '', files: [], musicFile: null });
    } catch (e) {
      console.error(e);
      alert("Error creating album: " + e.message);
    } finally {
      setLoading(false);
      setGlobalStatus(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{albums.length} e-albums</p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors">
          <Plus className="w-4 h-4" /> New E-Album
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="glass rounded-xl p-4 space-y-4 border border-gold/15">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40">
                  {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-charcoal text-white">{cat}</option>)}
                </select>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Album Title" className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
              </div>
              <div className="flex items-center gap-3">
                <input type="file" ref={fileRef} multiple accept="image/*" onChange={(e) => setForm({ ...form, files: Array.from(e.target.files) })} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-silver/50 hover:border-gold/50 hover:text-gold transition-colors text-sm">
                  {form.files.length > 0 ? `${form.files.length} images selected` : "Select Images"}
                </button>

                <input type="file" ref={musicRef} accept="audio/*" onChange={(e) => setForm({ ...form, musicFile: e.target.files[0] })} className="hidden" />
                <button onClick={() => musicRef.current?.click()} className="flex-1 py-2 rounded-lg border border-dashed border-white/20 text-silver/50 hover:border-gold/50 hover:text-gold transition-colors text-sm truncate px-2">
                  {form.musicFile ? form.musicFile.name : "Select Audio (Optional)"}
                </button>

                <button onClick={handleAdd} disabled={loading} className="px-5 py-2 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light disabled:opacity-50 flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Album"}
                </button>
                <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-silver/40 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {albums.map((album) => (
            <motion.div key={album.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group glass rounded-2xl overflow-hidden hover:border-gold/20 border border-white/[0.05] transition-all relative">
              <div className="h-36 bg-charcoal flex items-center justify-center overflow-hidden">
                {album.coverUrl ? (
                  <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
                ) : (
                  <BookOpen className="w-10 h-10 text-white/20" />
                )}
              </div>
              <div className="p-4">
                <p className="text-gold/70 text-[10px] tracking-[0.2em] uppercase mb-0.5">{album.eventName}</p>
                <h3 className="text-white text-sm font-medium mb-1 truncate">{album.title}</h3>
                <p className="text-silver/40 text-xs">{album.photos?.length || 0} photos</p>
                <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onDelete(album.id, null, album.photos)} className="p-1.5 rounded-lg bg-red-500/80 text-white md:bg-red-500/20 md:text-red-400 hover:bg-red-500/40 backdrop-blur-md">
                    <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Videos Tab ────────────────────────────────────────────────────────────────
function VideosTab({ items, onAdd, onDelete, setGlobalStatus }) {
  const videos = items.filter(i => i.category === 'video');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ eventName: EVENT_CATEGORIES[0], title: '', url: '' });

  const handleAdd = async () => {
    if (!form.eventName || !form.title || !form.url) return alert("Please fill all fields.");
    try {
      await onAdd({ category: 'video', eventName: form.eventName, title: form.title, url: form.url }, setLoading);
      setAdding(false);
      setForm({ eventName: EVENT_CATEGORIES[0], title: '', url: '' });
    } catch (e) {
      alert("Error adding video: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{videos.length} videos</p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors">
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="glass rounded-xl p-4 space-y-4 border border-gold/15">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40">
                    {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-charcoal text-white">{cat}</option>)}
                  </select>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video Title" className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/50" />
                    <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="YouTube URL…" className="w-full bg-charcoal/40 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
                  </div>
                  <button onClick={handleAdd} disabled={loading} className="px-5 py-2 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light disabled:opacity-50 flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                  </button>
                  <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-silver/40 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {videos.map((v) => {
            const thumb = getYoutubeThumbnail(v.url);
            return (
              <motion.div key={v.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group glass rounded-2xl overflow-hidden border border-white/[0.05] hover:border-gold/20 transition-all relative">
                <div className="relative h-40 bg-charcoal/50">
                  {thumb ? <img src={thumb} alt={v.title} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-10 h-10 text-white/20" /></div>}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-gold/70 text-[10px] tracking-[0.2em] uppercase mb-0.5">{v.eventName}</p>
                  <p className="text-white text-sm truncate">{v.title}</p>
                </div>
                <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onDelete(v.id)} className="p-1.5 rounded-lg bg-red-500/80 text-white md:bg-red-500/20 md:text-red-400 hover:bg-red-500/40 backdrop-blur-md">
                    <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PortfolioManager() {
  const [activeTab, setActiveTab] = useState('photos');
  const [globalUploadStatus, setGlobalUploadStatus] = useState(null);
  const queryClient = useQueryClient();

  const { data: portfolioItems = [], isLoading: loading } = useQuery({
    queryKey: ['portfolio', 'items'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/portfolio`);
      const data = await res.json();
      return data.items || [];
    }
  });

  const handleAddItem = async (payload, setLocalLoading) => {
    if (setLocalLoading) setLocalLoading(true);
    // Don't override status if already set by child component (e.g., photo upload progress)
    setGlobalUploadStatus(prev => prev || `Saving ${payload.category}...`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to add portfolio item");
      const data = await res.json();
      queryClient.setQueryData(['portfolio', 'items'], old => [data.item, ...(old || [])]);
    } finally {
      if (setLocalLoading) setLocalLoading(false);
      setGlobalUploadStatus(null);
    }
  };

  const handleDeleteItem = async (id, photoUrl, albumPhotos) => {
    // Optimistic UI update
    queryClient.setQueryData(['portfolio', 'items'], old => old.filter(item => item.id !== id));
    
    // Delete from storage if necessary
    try {
      if (photoUrl) {
        const storageRef = ref(storage, photoUrl);
        await deleteObject(storageRef).catch(e => console.error("Storage delete error:", e));
      }
      if (albumPhotos && albumPhotos.length > 0) {
        for (const p of albumPhotos) {
          const storageRef = ref(storage, p.url);
          await deleteObject(storageRef).catch(e => console.error("Storage delete error:", e));
        }
      }
    } catch (err) { console.error(err); }

    // Delete from DB
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/portfolio/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error("Error deleting portfolio item:", err));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">Content</p>
        <h2 className="font-serif text-2xl text-white font-light">Portfolio Manager</h2>
        <p className="text-silver/40 text-sm mt-1">Manage all public-facing media on your landing page.</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
        <TabBtn id="photos" label="Photos" icon={Images} active={activeTab === 'photos'} onClick={setActiveTab} count={portfolioItems.filter(i => i.category === 'photo').length} />
        <TabBtn id="albums" label="E-Albums" icon={BookOpen} active={activeTab === 'albums'} onClick={setActiveTab} count={portfolioItems.filter(i => i.category === 'e-album').length} />
        <TabBtn id="videos" label="Videos" icon={Film} active={activeTab === 'videos'} onClick={setActiveTab} count={portfolioItems.filter(i => i.category === 'video').length} />
      </div>

      <AnimatePresence>
        {globalUploadStatus && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-gold text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin" /> {globalUploadStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
            {activeTab === 'photos' && <PhotosTab items={portfolioItems} onAdd={handleAddItem} onDelete={handleDeleteItem} setGlobalStatus={setGlobalUploadStatus} />}
            {activeTab === 'albums' && <AlbumsTab items={portfolioItems} onAdd={handleAddItem} onDelete={handleDeleteItem} setGlobalStatus={setGlobalUploadStatus} />}
            {activeTab === 'videos' && <VideosTab items={portfolioItems} onAdd={handleAddItem} onDelete={handleDeleteItem} setGlobalStatus={setGlobalUploadStatus} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
