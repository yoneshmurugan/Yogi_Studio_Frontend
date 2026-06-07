import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Film, BookOpen, Plus, Trash2, Star, StarOff,
  Eye, EyeOff, Upload, Link2, X
} from 'lucide-react';

// ── Placeholder image colours (used before real images are uploaded) ──────────
const PLACEHOLDER_COLORS = [
  'from-gold/20 to-gold/5', 'from-purple-500/20 to-purple-500/5',
  'from-blue-500/20 to-blue-500/5', 'from-emerald-500/20 to-emerald-500/5',
  'from-rose-500/20 to-rose-500/5', 'from-amber-500/20 to-amber-500/5',
];

// ── Seed portfolio images ─────────────────────────────────────────────────────
const seedPhotos = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  url: null,
  label: `portfolio-${String(i + 1).padStart(2, '0')}`,
  color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
  hero: i === 0,
}));

const seedAlbums = [
  { id: 1, name: 'The Henderson Wedding', count: 45, cover: null, color: 'from-gold/20 to-gold/5' },
  { id: 2, name: 'Rooftop Portraits 2026', count: 28, cover: null, color: 'from-blue-500/20 to-blue-500/5' },
  { id: 3, name: 'Garden Ceremonies',      count: 62, cover: null, color: 'from-emerald-500/20 to-emerald-500/5' },
];

const seedVideos = [
  { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Studio Showreel 2026', visible: true },
  { id: 2, url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', title: 'Wedding Highlights Reel', visible: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getYoutubeThumbnail(url) {
  try {
    const u = new URL(url);
    const id = u.searchParams.get('v') || u.pathname.split('/').pop();
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  } catch { return null; }
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({ id, label, icon: Icon, active, onClick, count }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
        ${active ? 'bg-gold/10 text-gold border border-gold/30' : 'text-silver/50 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-gold/20 text-gold' : 'bg-white/8 text-silver/50'}`}>{count}</span>
      )}
    </button>
  );
}

// ── Photos Tab ────────────────────────────────────────────────────────────────
function PhotosTab() {
  const [photos, setPhotos] = useState(seedPhotos);
  const fileRef = useRef();

  const handleFiles = (files) => {
    const newPhotos = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(f),
      label: f.name,
      color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
      hero: false,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto  = (id) => setPhotos((p) => p.filter((x) => x.id !== id));
  const toggleHero   = (id) => setPhotos((p) => p.map((x) => ({ ...x, hero: x.id === id ? !x.hero : false })));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{photos.length} images in portfolio</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload Images
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id} layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="group relative aspect-square rounded-xl overflow-hidden"
            >
              {photo.url ? (
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${photo.color} flex items-center justify-center`}>
                  <Images className="w-6 h-6 text-white/20" />
                </div>
              )}
              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button onClick={() => toggleHero(photo.id)}
                  className={`p-1.5 rounded-lg transition-colors ${photo.hero ? 'text-gold bg-gold/20' : 'text-white/60 hover:text-gold bg-black/40'}`}>
                  {photo.hero ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => removePhoto(photo.id)}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {photo.hero && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-gold/90 text-black text-[9px] font-bold">HERO</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── E-Albums Tab ──────────────────────────────────────────────────────────────
function AlbumsTab() {
  const [albums, setAlbums] = useState(seedAlbums);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const createAlbum = () => {
    if (!newName.trim()) return;
    setAlbums((a) => [...a, {
      id: Date.now(), name: newName, count: 0, cover: null,
      color: PLACEHOLDER_COLORS[a.length % PLACEHOLDER_COLORS.length],
    }]);
    setNewName(''); setCreating(false);
  };
  const deleteAlbum = (id) => setAlbums((a) => a.filter((x) => x.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{albums.length} e-albums</p>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors">
          <Plus className="w-4 h-4" /> New Album
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden">
            <div className="glass rounded-xl p-4 flex gap-3 border border-gold/15">
              <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createAlbum(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Album name…"
                className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 focus:outline-none focus:border-gold/40 placeholder:text-silver/30" />
              <button onClick={createAlbum} className="px-4 py-1.5 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors">Create</button>
              <button onClick={() => setCreating(false)} className="px-3 py-1.5 rounded-lg text-silver/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {albums.map((album) => (
            <motion.div key={album.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="group glass rounded-2xl overflow-hidden hover:border-gold/20 border border-white/[0.05] transition-all">
              {/* Cover */}
              <div className={`h-36 bg-gradient-to-br ${album.color} flex items-center justify-center`}>
                <BookOpen className="w-10 h-10 text-white/20" />
              </div>
              <div className="p-4">
                <h3 className="text-white text-sm font-medium mb-1 truncate">{album.name}</h3>
                <p className="text-silver/40 text-xs">{album.count} photos</p>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 py-1.5 rounded-lg bg-white/5 text-silver/60 text-xs hover:text-white transition-colors">Edit</button>
                  <button onClick={() => deleteAlbum(album.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
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
function VideosTab() {
  const [videos, setVideos] = useState(seedVideos);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addVideo = () => {
    if (!newUrl.trim()) return;
    setVideos((v) => [...v, { id: Date.now(), url: newUrl, title: newTitle || 'Untitled Video', visible: true }]);
    setNewUrl(''); setNewTitle(''); setAdding(false);
  };
  const toggleVisible = (id) => setVideos((v) => v.map((x) => x.id === id ? { ...x, visible: !x.visible } : x));
  const deleteVideo   = (id) => setVideos((v) => v.filter((x) => x.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-silver/50 text-sm">{videos.length} videos</p>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors">
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden">
            <div className="glass rounded-xl p-4 space-y-3 border border-gold/15">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Video title…"
                className="w-full bg-charcoal/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/50" />
                  <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="YouTube URL…"
                    className="w-full bg-charcoal/40 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40" />
                </div>
                <button onClick={addVideo} className="px-4 py-2 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light">Add</button>
                <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg text-silver/40 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {videos.map((v) => {
            const thumb = getYoutubeThumbnail(v.url);
            return (
              <motion.div key={v.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`group glass rounded-2xl overflow-hidden border transition-all ${v.visible ? 'border-white/[0.05] hover:border-gold/20' : 'border-white/[0.03] opacity-50'}`}>
                {/* Thumbnail */}
                <div className="relative h-40 bg-charcoal/50">
                  {thumb ? (
                    <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="text-white text-sm truncate flex-1">{v.title}</p>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => toggleVisible(v.id)}
                      className="p-1.5 rounded-lg bg-white/5 text-silver/50 hover:text-white transition-colors">
                      {v.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteVideo(v.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">Content</p>
        <h2 className="font-serif text-2xl text-white font-light">Portfolio Manager</h2>
        <p className="text-silver/40 text-sm mt-1">Manage all public-facing media on your landing page.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
        <TabBtn id="photos"   label="Photos"   icon={Images}   active={activeTab === 'photos'}   onClick={setActiveTab} count={seedPhotos.length} />
        <TabBtn id="albums"   label="E-Albums" icon={BookOpen} active={activeTab === 'albums'}   onClick={setActiveTab} count={seedAlbums.length} />
        <TabBtn id="videos"   label="Videos"   icon={Film}     active={activeTab === 'videos'}   onClick={setActiveTab} count={seedVideos.length} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'photos' && <PhotosTab />}
          {activeTab === 'albums' && <AlbumsTab />}
          {activeTab === 'videos' && <VideosTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
