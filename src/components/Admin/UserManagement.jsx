import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserX, ChevronRight, Plus, Trash2, Calendar,
  Folder, FolderOpen, Share2, MessageCircle, Mail, Copy,
  Check, Download, X, Upload, FileImage, QrCode,
  SlidersHorizontal, Phone, ChevronDown, ChevronUp,
  Camera, CheckSquare,
} from 'lucide-react';
import { QRCode } from 'react-qr-code';

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['Wedding', 'Engagement', 'Portrait', 'Corporate', 'Other'];
const PACKAGES   = [
  { id: 'Essential', sub: 'Up to 50 photos',      color: 'border-silver/20 text-silver' },
  { id: 'Premium',   sub: 'Up to 150 photos',     color: 'border-gold/30 text-gold' },
  { id: 'Elite',     sub: 'Unlimited photos',     color: 'border-purple-400/30 text-purple-400' },
];

const STATUS_META = {
  pending:           { label: 'No Photos',        cls: 'bg-white/5 text-silver/50 border-white/10' },
  active:            { label: 'Ready for Client', cls: 'bg-gold/10 text-gold border-gold/20',            pulse: true },
  awaiting_approval: { label: 'Awaiting Approval',cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  complete:          { label: 'Approved',         cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  downloaded:        { label: 'Downloaded',       cls: 'bg-purple-400/10 text-purple-400 border-purple-400/20' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${m.pulse ? 'animate-pulse' : ''}`} />
      {m.label}
    </span>
  );
}

function Breadcrumb({ crumbs }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm">
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-silver/30" />}
          {c.onClick ? (
            <button
              onClick={c.onClick}
              className="text-silver/50 hover:text-gold transition-colors"
            >
              {c.label}
            </button>
          ) : (
            <span className="text-white font-medium">{c.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Create Event Form ──────────────────────────────────────────────────────────
function CreateEventForm({ userId, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    eventName: '', category: '', date: '', package: '', notes: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.eventName || !form.category || !form.package) return;
    const token = btoa(`${userId}-${form.eventName}-${Date.now()}`)
      .slice(0, 12)
      .replace(/[^a-zA-Z0-9]/g, 'X');
    onSubmit({
      id: Date.now(),
      userId,
      eventName: form.eventName,
      category: form.category,
      date: form.date || '',
      package: form.package,
      notes: form.notes,
      accessToken: token,
      status: 'pending',
      downloadedAt: null,
    });
  };

  const inputCls = 'w-full bg-charcoal/40 border border-white/8 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-silver/25 focus:outline-none focus:border-gold/40 transition-all [color-scheme:dark]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass rounded-2xl p-6 border border-gold/10"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-white font-medium">New Event</p>
        <button onClick={onCancel} className="text-silver/40 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event name */}
        <div>
          <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-1.5">Event Name</label>
          <input value={form.eventName} onChange={set('eventName')} placeholder="e.g. The Henderson Wedding" required className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-1.5">Category</label>
            <select value={form.category} onChange={set('category')} required
              className={`${inputCls} appearance-none cursor-pointer`}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Date */}
          <div>
            <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-1.5">Event Date</label>
            <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
          </div>
        </div>

        {/* Package */}
        <div>
          <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2">Package</label>
          <div className="flex gap-2">
            {PACKAGES.map((pkg) => (
              <label key={pkg.id} className="flex-1 cursor-pointer">
                <input type="radio" name="pkg" value={pkg.id} checked={form.package === pkg.id}
                  onChange={set('package')} className="sr-only" />
                <div className={`px-3 py-2 rounded-xl border text-center transition-all text-xs
                  ${form.package === pkg.id ? 'bg-gold/10 border-gold/40 text-gold' : `bg-charcoal/30 ${pkg.color}`}`}>
                  <p className="font-medium">{pkg.id}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{pkg.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-1.5">Notes (optional)</label>
          <textarea value={form.notes} onChange={set('notes')} placeholder="Any special instructions…" rows={2}
            className={`${inputCls} resize-none`} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm hover:border-white/20 hover:text-white transition-all">
            Cancel
          </button>
          <button type="submit"
            disabled={!form.eventName || !form.category || !form.package}
            className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Create Event
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Folder Card ────────────────────────────────────────────────────────────────
function FolderCard({ folder, onAddPhotos, onDeletePhoto, onDelete, onRename }) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName]   = useState(folder.name);
  const fileRef = useRef();

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const photos = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(0) + ' KB',
    }));
    onAddPhotos(folder.id, photos);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const photos = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(0) + ' KB',
    }));
    onAddPhotos(folder.id, photos);
  };

  const handleRenameConfirm = () => {
    if (newName.trim()) onRename(folder.id, newName.trim());
    setRenaming(false);
  };

  return (
    <motion.div layout className="glass rounded-xl overflow-hidden border border-white/[0.05]">
      {/* Folder header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
          {expanded
            ? <FolderOpen className="w-4 h-4 text-gold" />
            : <Folder className="w-4 h-4 text-gold/70" />}
        </div>

        {renaming ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameConfirm();
              if (e.key === 'Escape') setRenaming(false);
            }}
            onBlur={handleRenameConfirm}
            className="flex-1 bg-transparent border-b border-gold/40 text-white text-sm focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="flex-1 text-left text-white text-sm font-medium hover:text-gold transition-colors"
          >
            {folder.name}
          </button>
        )}

        <span className="text-silver/40 text-xs">{folder.photos.length} photos</span>

        {/* Action buttons */}
        <button
          onClick={() => fileRef.current?.click()}
          className="p-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          title="Upload photos"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(folder.id)}
          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          title="Delete folder"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1.5 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
      </div>

      {/* Expanded: drop zone + photo grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.05] pt-4 space-y-3">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="relative flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/10
                  hover:border-gold/30 hover:bg-gold/[0.02] cursor-pointer transition-all"
              >
                <Upload className="w-5 h-5 text-silver/30" />
                <p className="text-silver/40 text-xs">Drop photos here or click to upload</p>
              </div>

              {/* Photo grid */}
              {folder.photos.length > 0 && (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  <AnimatePresence>
                    {folder.photos.map((ph) => (
                      <motion.div
                        key={ph.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-charcoal/50"
                      >
                        <img src={ph.url} alt={ph.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => onDeletePhoto(folder.id, ph.id)}
                            className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Event Detail ───────────────────────────────────────────────────────────────
function EventDetail({
  event, user, eventFolders,
  onBack, onUpdateEvent, onAddFolder, onDeleteFolder, onRenameFolder,
  onAddPhotosToFolder, onDeletePhotoFromFolder,
}) {
  const [newFolderName, setNewFolderName]   = useState('');
  const [addingFolder, setAddingFolder]     = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState(null);

  const url = `${window.location.origin}/gallery/${event.accessToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi ${user.name}! 🎉\n\nYour photos from *${event.eventName}* are ready.\n\nBrowse and select your favourites:\n${url}\n\n— Yogi Studio`
    );
    window.open(
      user.phone
        ? `https://wa.me/${user.phone.replace(/\D/g, '')}?text=${msg}`
        : `https://wa.me/?text=${msg}`,
      '_blank'
    );
  };

  const handleEmail = () => {
    const sub  = encodeURIComponent(`Your Photos Are Ready — ${event.eventName}`);
    const body = encodeURIComponent(
      `Hi ${user.name},\n\nYour photos are ready! Visit the link below to browse and select your favourites:\n\n${url}\n\nWarm regards,\nYogi Studio`
    );
    window.open(`mailto:?subject=${sub}&body=${body}`);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onAddFolder({ id: Date.now(), eventId: event.id, name: newFolderName.trim(), photos: [] });
    setNewFolderName('');
    setAddingFolder(false);
  };

  const handleMarkDownloaded = () => {
    onUpdateEvent(event.id, { downloadedAt: new Date().toISOString().slice(0, 10), status: 'downloaded' });
  };

  return (
    <motion.div
      key="event-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Breadcrumb
        crumbs={[
          { label: 'Users',      onClick: () => onBack('list') },
          { label: user.name,    onClick: () => onBack('user') },
          { label: event.eventName },
        ]}
      />

      {/* Event header */}
      <div className="glass rounded-2xl p-6 mb-6 border border-white/[0.05]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">{event.category}</p>
            <h2 className="font-serif text-2xl text-white font-light mb-1">{event.eventName}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-silver/50 mt-1">
              {event.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              <span className="text-silver/30">·</span>
              <span>{event.package}</span>
              {event.notes && (
                <>
                  <span className="text-silver/30">·</span>
                  <span className="italic text-silver/40">{event.notes}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={event.status} />
            {event.downloadedAt ? (
              <span className="text-purple-400/70 text-xs flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" /> Downloaded {event.downloadedAt}
              </span>
            ) : (
              <button
                onClick={handleMarkDownloaded}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Mark as Downloaded
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Pass + Share row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* QR + link */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <p className="text-gold/70 text-[10px] tracking-[0.3em] uppercase mb-4">Access Pass</p>
          <div className="flex items-start gap-5">
            <div className="inline-flex p-2.5 bg-white rounded-xl shadow-lg flex-shrink-0">
              <QRCode value={url} size={96} level="H" bgColor="#FFFFFF" fgColor="#0B0B0B" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-silver/50 text-[10px] mb-1">Gallery link for {user.name}</p>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2 border border-white/[0.06]">
                <p className="text-white/60 text-xs font-mono truncate flex-1">{url}</p>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1 rounded text-silver/40 hover:text-gold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-silver/30 text-[10px] mt-1.5">
                Token: <span className="font-mono text-white/50">{event.accessToken}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <p className="text-gold/70 text-[10px] tracking-[0.3em] uppercase mb-4">Share with Client</p>
          <div className="space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm hover:bg-[#25D366]/15 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </button>
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/15 transition-all"
            >
              <Mail className="w-4 h-4" />
              Send via Email
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-silver/60 text-sm hover:text-white hover:border-white/20 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Folders section */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-0.5">Photo Selection</p>
          <h3 className="font-serif text-xl text-white font-light">Folders</h3>
        </div>
        <button
          onClick={() => setAddingFolder(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Folder
        </button>
      </div>

      {/* New folder input */}
      <AnimatePresence>
        {addingFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="glass rounded-xl p-4 flex gap-3 border border-gold/15">
              <Folder className="w-4 h-4 text-gold/60 self-center flex-shrink-0" />
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setAddingFolder(false);
                }}
                placeholder="Folder name (e.g. Ceremony, Reception…)"
                className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 focus:outline-none focus:border-gold/40 placeholder:text-silver/30"
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-1.5 rounded-lg bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setAddingFolder(false)}
                className="px-2 py-1.5 rounded-lg text-silver/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder list */}
      {eventFolders.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border border-white/[0.04]">
          <FolderOpen className="w-8 h-8 text-silver/20 mx-auto mb-3" />
          <p className="text-silver/40 text-sm">No folders yet.</p>
          <p className="text-silver/25 text-xs mt-1">Create a folder and upload photos for the client to select from.</p>
        </div>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {eventFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onAddPhotos={onAddPhotosToFolder}
                onDeletePhoto={onDeletePhotoFromFolder}
                onDelete={(id) => setDeleteTarget({ type: 'folder', id })}
                onRename={onRenameFolder}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirm delete modal */}
      <AnimatePresence>
        {deleteTarget?.type === 'folder' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm glass-strong rounded-2xl p-6 border border-red-500/20"
            >
              <p className="text-white font-medium mb-2">Delete Folder?</p>
              <p className="text-silver/50 text-sm mb-5">
                All photos inside this folder will be removed. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => { onDeleteFolder(deleteTarget.id); setDeleteTarget(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── User Detail ────────────────────────────────────────────────────────────────
function UserDetail({
  user, userEvents, folders,
  onBack, onAddEvent, onDeleteEvent, onUpdateEvent,
  onAddFolder, onDeleteFolder, onRenameFolder,
  onAddPhotosToFolder, onDeletePhotoFromFolder,
  onDeleteUser,
}) {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent]     = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  if (selectedEvent) {
    const eventFolders = folders.filter((f) => f.eventId === selectedEvent.id);
    // Find the latest version of the event from parent
    const liveEvent = userEvents.find((e) => e.id === selectedEvent.id) ?? selectedEvent;
    return (
      <EventDetail
        event={liveEvent}
        user={user}
        eventFolders={eventFolders}
        onBack={(target) => {
          if (target === 'list') { setSelectedEvent(null); onBack(); }
          else setSelectedEvent(null);
        }}
        onUpdateEvent={onUpdateEvent}
        onAddFolder={onAddFolder}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
        onAddPhotosToFolder={onAddPhotosToFolder}
        onDeletePhotoFromFolder={onDeletePhotoFromFolder}
      />
    );
  }

  return (
    <motion.div
      key="user-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Breadcrumb
        crumbs={[
          { label: 'Users', onClick: onBack },
          { label: user.name },
        ]}
      />

      {/* User card */}
      <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-5 border border-white/[0.05]">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {initials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-lg">{user.name}</p>
          <p className="text-silver/50 text-sm flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3.5 h-3.5" />{user.phone}
          </p>
          <p className="text-silver/30 text-xs mt-1">Client since {user.createdAt}</p>
        </div>
        <button
          onClick={() => setDeleteTarget({ type: 'user', id: user.id })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete User
        </button>
      </div>

      {/* Events */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-0.5">Events</p>
          <h3 className="font-serif text-xl text-white font-light">
            {userEvents.length} event{userEvents.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Create event form */}
      <AnimatePresence>
        {showCreateEvent && (
          <div className="mb-4">
            <CreateEventForm
              userId={user.id}
              onSubmit={(ev) => { onAddEvent(ev); setShowCreateEvent(false); setSelectedEvent(ev); }}
              onCancel={() => setShowCreateEvent(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Event grid */}
      {userEvents.length === 0 && !showCreateEvent ? (
        <div className="glass rounded-2xl p-10 text-center border border-white/[0.04]">
          <Camera className="w-8 h-8 text-silver/20 mx-auto mb-3" />
          <p className="text-silver/40 text-sm">No events yet.</p>
          <p className="text-silver/25 text-xs mt-1">Click "Create Event" to add the first event for this client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {userEvents.map((ev) => {
              const folderCount = folders.filter((f) => f.eventId === ev.id).length;
              const photoCount  = folders.filter((f) => f.eventId === ev.id)
                .reduce((s, f) => s + f.photos.length, 0);
              return (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass rounded-2xl p-5 border border-white/[0.05] hover:border-gold/20 transition-all cursor-pointer group"
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-gold/70" />
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'event', id: ev.id }); }}
                      className="p-1.5 rounded-lg text-red-400/0 group-hover:text-red-400/50 hover:!text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-gold/60 text-[10px] tracking-[0.2em] uppercase mb-1">{ev.category}</p>
                  <p className="text-white font-medium mb-1 truncate">{ev.eventName}</p>

                  {ev.date && (
                    <p className="text-silver/40 text-xs flex items-center gap-1 mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-silver/40">
                      <span className="flex items-center gap-1"><Folder className="w-3 h-3" />{folderCount}</span>
                      <span className="flex items-center gap-1"><FileImage className="w-3 h-3" />{photoCount}</span>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-end text-gold/50 group-hover:text-gold transition-colors text-xs">
                    View <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete modals */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm glass-strong rounded-2xl p-6 border border-red-500/20"
            >
              <p className="text-white font-medium mb-2">
                {deleteTarget.type === 'user' ? 'Delete User?' : 'Delete Event?'}
              </p>
              <p className="text-silver/50 text-sm mb-5">
                {deleteTarget.type === 'user'
                  ? 'All events and folders for this user will be permanently removed.'
                  : 'All folders and photos for this event will be permanently removed.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteTarget.type === 'user') { onDeleteUser(user.id); onBack(); }
                    else onDeleteEvent(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main: User List ────────────────────────────────────────────────────────────
export default function UserManagement({
  users, events, folders,
  onDeleteUser, onAddEvent, onDeleteEvent, onUpdateEvent,
  onAddFolder, onDeleteFolder, onRenameFolder,
  onAddPhotosToFolder, onDeletePhotoFromFolder,
}) {
  const [search, setSearch]           = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  if (selectedUser) {
    const userEvents = events.filter((e) => e.userId === selectedUser.id);
    // Keep selectedUser in sync if parent re-renders
    const liveUser = users.find((u) => u.id === selectedUser.id);
    if (!liveUser) { setSelectedUser(null); return null; }
    return (
      <UserDetail
        user={liveUser}
        userEvents={userEvents}
        folders={folders}
        onBack={() => setSelectedUser(null)}
        onAddEvent={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onUpdateEvent={onUpdateEvent}
        onAddFolder={onAddFolder}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
        onAddPhotosToFolder={onAddPhotosToFolder}
        onDeletePhotoFromFolder={onDeletePhotoFromFolder}
        onDeleteUser={(id) => { onDeleteUser(id); setSelectedUser(null); }}
      />
    );
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.phone.includes(q);
  });

  return (
    <motion.div
      key="user-list"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">Management</p>
          <h2 className="font-serif text-2xl text-white font-light">All Users</h2>
          <p className="text-silver/40 text-sm mt-1">Click a user to manage their events.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full bg-charcoal/40 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-silver/25
              focus:outline-none focus:border-gold/40 transition-all"
          />
        </div>
      </div>

      {/* Result count */}
      <p className="text-silver/30 text-xs mb-4">
        {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
      </p>

      {/* User rows */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border border-white/[0.04]">
          <UserX className="w-10 h-10 text-silver/20 mx-auto mb-3" />
          <p className="text-silver/50 text-sm">No users match your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const eventCount = events.filter((e) => e.userId === user.id).length;
            return (
              <motion.button
                key={user.id}
                layout
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedUser(user)}
                className="w-full glass rounded-xl px-5 py-4 flex items-center gap-4 text-left border border-white/[0.04] hover:border-gold/20 transition-all group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xs font-bold">{initials(user.name)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-silver/45 text-xs flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3" />{user.phone}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-silver/40">
                  <span>{eventCount} event{eventCount !== 1 ? 's' : ''}</span>
                  <span>Since {user.createdAt}</span>
                </div>

                {/* Status + arrow */}
                <span className={`text-[10px] px-2.5 py-1 rounded-full border
                  ${user.status === 'active'
                    ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-silver/40'}`}>
                  {user.status}
                </span>
                <ChevronRight className="w-4 h-4 text-silver/20 group-hover:text-gold transition-colors flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
