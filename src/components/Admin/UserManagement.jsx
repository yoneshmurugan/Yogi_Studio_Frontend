import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FolderOpen, Upload, Trash2, Edit2, Download, ExternalLink, Mail, MessageSquare, 
  ChevronDown, ChevronUp, Lock, CheckCircle2, AlertCircle, RefreshCw, Smartphone,
  Search, UserX, ChevronRight, Plus, Calendar, Share2, MessageCircle, Copy,
  Check, X, FileImage, QrCode, SlidersHorizontal, Phone, Camera, CheckSquare, ArrowLeft, Star, Unlock
} from 'lucide-react';
import { QRCode } from 'react-qr-code';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { ErrorBoundary } from '../ErrorBoundary';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useParams, useNavigate } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['Wedding', 'Engagement', 'Portrait', 'Corporate', 'Other'];

const STATUS_META = {
  pending:           { label: 'Draft',        cls: 'bg-white/5 text-silver/50 border-white/10' },
  active:            { label: 'Ready for Client', cls: 'bg-gold/10 text-gold border-gold/20',            pulse: true },
  awaiting_approval: { label: 'Done Selection',cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  complete:          { label: 'Reviewed',         cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
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
      <div className="flex items-center gap-3">
        <button
          onClick={crumbs[0].onClick}
          className="p-2 -ml-2 rounded-xl text-silver/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {crumbs.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-4 h-4 text-silver/30" />}
            {c.onClick ? (
              <button
                onClick={c.onClick}
                className="text-silver/50 hover:text-gold transition-colors font-medium"
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

// ── Create Event Modal ────────────────────────────────────────────────────────
function CreateEventModal({ user, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    eventName: '', category: '', date: '', notes: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.eventName || !form.category) return;
    
    onSubmit({
      customerPhone: user.phone,
      customerName: user.name,
      eventName: form.eventName,
      category: form.category,
      date: form.date || '',
      notes: form.notes,
    });
  };

  const inputCls = 'w-full bg-charcoal/40 border border-white/8 rounded-xl py-3 px-4 text-sm text-white placeholder:text-silver/25 focus:outline-none focus:border-gold/40 transition-all [color-scheme:dark]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass w-full max-w-xl rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl relative mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onCancel} className="absolute top-4 md:top-6 right-4 md:right-6 p-2 rounded-full hover:bg-white/5 transition-colors group">
          <X className="w-5 h-5 text-silver/40 group-hover:text-white" />
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 border border-gold/20">
            <Calendar className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-1">Create New Event</h2>
          <p className="text-silver/40 text-sm">for {user.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2 ml-1">Event Name</label>
            <input value={form.eventName} onChange={set('eventName')} placeholder="e.g. The Henderson Wedding" required className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2 ml-1">Category</label>
              <div className="relative">
                <select value={form.category} onChange={set('category')} required
                  className={`${inputCls} appearance-none cursor-pointer pr-10`}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2 ml-1">Date</label>
              <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2 ml-1">Notes (Optional)</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Any special instructions…" rows={3}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-6 md:mt-8">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-silver/60 font-medium hover:bg-white/5 hover:text-white transition-all order-2 sm:order-1">
              Cancel
            </button>
            <button type="submit"
              disabled={!form.eventName || !form.category}
              className="flex-1 py-3.5 rounded-xl gold-gradient text-black font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all order-1 sm:order-2">
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Folder Card ────────────────────────────────────────────────────────────────
function FolderCard({ folder, user, onAddPhotos, onDeletePhoto, onDelete, onRename, onSetCoverImage }) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName]   = useState(folder.name);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const processAndUploadFiles = async (files) => {
    setUploading(true);
    setProgress(0);
    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Compress image to ~100-150KB
        const options = {
          maxSizeMB: 0.15,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          initialQuality: 0.7, // Helps to drop quality further if needed
        };
        const compressedFile = await imageCompression(file, options);
        
        // Upload to Firebase Storage using the exact original file name
        const fileName = file.name;
        const fileRef = ref(storage, `events/folders/${folder.id}/${fileName}`);
        
        await uploadBytes(fileRef, compressedFile);
        const downloadUrl = await getDownloadURL(fileRef);

        uploadedPhotos.push({
          id: fileName,
          url: downloadUrl,
          name: file.name,
          size: (compressedFile.size / 1024).toFixed(0) + ' KB',
        });
      } catch (err) {
        console.error("Upload failed for file:", file.name, err);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    if (uploadedPhotos.length > 0) {
      onAddPhotos(folder.id, uploadedPhotos);
    }
    setUploading(false);
    setProgress(0);
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    await processAndUploadFiles(files);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    await processAndUploadFiles(files);
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
              {/* Drop zone / Upload State */}
              {uploading ? (
                <div className="flex flex-col items-center justify-center py-6 rounded-xl border border-white/5 bg-white/[0.02]">
                  <RefreshCw className="w-5 h-5 text-gold animate-spin mb-3" />
                  <p className="text-white text-sm font-medium mb-1">Compressing & Uploading...</p>
                  <p className="text-silver/40 text-xs">{progress}% Complete</p>
                  <div className="w-48 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-gold transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/10
                    hover:border-gold/30 hover:bg-gold/[0.02] cursor-pointer transition-all"
                >
                  <Upload className="w-5 h-5 text-silver/30" />
                  <p className="text-silver/40 text-xs">Drop photos here or click to upload (Auto-compressed &lt;300KB)</p>
                </div>
              )}

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
                        <div className={`absolute top-1 left-1 flex items-center justify-center transition-all ${folder.coverImage === ph.url ? 'opacity-100 z-10' : 'opacity-0 group-hover:opacity-100 z-10'}`}>
                          <button
                            onClick={() => onSetCoverImage(folder.id, ph.url)}
                            className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-full border backdrop-blur-md shadow-lg transition-all ${folder.coverImage === ph.url ? 'bg-gold border-gold text-black shadow-gold/20' : 'bg-black/60 border-white/20 text-white hover:bg-black/80 hover:border-gold hover:text-gold'}`}
                            title={folder.coverImage === ph.url ? "Current Cover Image" : "Set as Cover"}
                          >
                            <Star className={`w-3.5 h-3.5 ${folder.coverImage === ph.url ? 'fill-black' : ''}`} />
                            {(folder.coverImage || user?.profileImage) && <span className="text-[9px] font-bold uppercase tracking-wider pr-0.5">Cover</span>}
                          </button>
                        </div>
                        <div className="absolute top-1 right-1 opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => onDeletePhoto(folder.id, ph.id)}
                            className="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-red-500/80"
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
  onAddPhotosToFolder, onDeletePhotoFromFolder, onSetFolderCoverImage,
}) {
  const [newFolderName, setNewFolderName]   = useState('');
  const [addingFolder, setAddingFolder]     = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const selectedPhotos = eventFolders.flatMap(f => f.photos || []).filter(p => p.is_selected);

  const handleDownloadZip = async () => {
    // Collect all selected photos with their folder names
    const selectedPhotosWithFolder = eventFolders.flatMap(f => 
      (f.photos || [])
        .filter(p => p.is_selected)
        .map(p => ({ ...p, folderName: f.name }))
    );

    if (selectedPhotosWithFolder.length === 0) return;
    setDownloadingZip(true);
    
    try {
      const zip = new JSZip();
      const safeName = event.eventName.replace(/[^a-zA-Z0-9]/g, '_');
      const rootFolder = zip.folder(`${safeName}_Selections`);
      
      selectedPhotosWithFolder.forEach((photo) => {
        const subFolder = rootFolder.folder(photo.folderName || 'Other');
        
        let fileName = photo.name || photo.id;
        if (photo.comment && photo.comment.trim() !== '') {
          const safeComment = photo.comment.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
          if (safeComment) fileName = `(${safeComment}) ${fileName}`;
        }
        
        // Add an EMPTY 0-byte file instead of downloading the real image!
        // This gives the Admin the exact filenames they need instantly with 0 bandwidth cost.
        subFolder.file(fileName, new Blob([]));
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${safeName}_Selections.zip`);
    } catch (err) {
      console.error("Zip generation failed:", err);
      alert("Failed to create zip file.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const url = `${window.location.origin}/client/photoselection/${event.id}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${event.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Scale up for better quality
      const scale = 4;
      // react-qr-code sets width and height attributes based on the size prop
      const baseWidth = svg.clientWidth || svg.getAttribute("width") || 96;
      const baseHeight = svg.clientHeight || svg.getAttribute("height") || 96;
      
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;
      
      // Draw white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((pngBlob) => {
        saveAs(pngBlob, `${event.eventName}_Access_Pass.png`);
      }, "image/png");
    };
    img.src = url;
  };

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
            {event.status === 'pending' && (
              <button
                onClick={() => onUpdateEvent(event.id, { status: 'active' })}
                className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors border border-gold/20"
              >
                Publish Event
              </button>
            )}
            {['awaiting_approval', 'approved', 'completed', 'downloaded'].includes(event.status) && (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                <Unlock className="w-3.5 h-3.5" /> Unlock Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Pass + Share row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* QR + link */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gold/70 text-[10px] tracking-[0.3em] uppercase">Access Pass</p>
            <button 
              onClick={handleDownloadQR}
              className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-silver/50 hover:text-white transition-colors"
            >
              <Download className="w-3 h-3" />
              Download QR
            </button>
          </div>
          <div className="flex items-start gap-5">
            <div className="inline-flex p-2.5 bg-white rounded-xl shadow-lg flex-shrink-0">
              <QRCode id={`qr-${event.id}`} value={url} size={96} level="H" bgColor="#FFFFFF" fgColor="#0B0B0B" />
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

      {/* Review Selections (Only if Awaiting Approval) */}
      <AnimatePresence>
        {event.status === 'awaiting_approval' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass-strong rounded-2xl p-6 border-2 border-blue-400/30 bg-blue-400/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <h3 className="font-serif text-xl text-white font-light">Client Selections Ready</h3>
                  </div>
                  <p className="text-silver/60 text-sm">
                    The client has finalised their selections. There are <strong className="text-gold">{selectedPhotos.length}</strong> photos selected across all folders.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadZip}
                    disabled={downloadingZip || selectedPhotos.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-all border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingZip ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloadingZip ? 'Packaging Zip...' : 'Download Selected (.zip)'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {addingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl relative"
            >
              <button onClick={() => setAddingFolder(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors group">
                <X className="w-5 h-5 text-silver/40 group-hover:text-white" />
              </button>

              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 border border-gold/20">
                  <Folder className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-1">Create Folder</h2>
                <p className="text-silver/40 text-sm">Organize photos for this event</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-silver/40 text-[10px] tracking-[0.2em] uppercase mb-2 ml-1">Folder Name</label>
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') setAddingFolder(false);
                    }}
                    placeholder="e.g. Ceremony, Reception…"
                    className="w-full bg-charcoal/40 border border-white/8 rounded-xl py-3 px-4 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40 transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={() => setAddingFolder(false)}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-silver/60 font-medium hover:bg-white/5 hover:text-white transition-all">
                    Cancel
                  </button>
                  <button onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="flex-1 py-3.5 rounded-xl gold-gradient text-black font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                    Create Folder
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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
                user={user}
                onAddPhotos={onAddPhotosToFolder}
                onDeletePhoto={onDeletePhotoFromFolder}
                onDelete={(id) => setDeleteTarget({ type: 'folder', id })}
                onRename={onRenameFolder}
                onSetCoverImage={onSetFolderCoverImage}
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

      {/* Confirm unlock modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUnlockModal(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm glass-strong rounded-2xl p-6 border border-red-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <Unlock className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-white font-medium mb-2 text-lg">Unlock Access?</p>
              <p className="text-silver/50 text-sm mb-6">
                Are you sure you want to unlock this event? The client will be able to change their selections again.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowUnlockModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-silver/60 font-medium hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => { 
                    onUpdateEvent(event.id, { status: 'selection_in_progress' }); 
                    setShowUnlockModal(false); 
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-medium transition-colors"
                >
                  Unlock Event
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
  user, userEvents, folders, initialEventId, clearInitialEventId,
  onBack, onAddEvent, onDeleteEvent, onUpdateEvent,
  onAddFolder, onDeleteFolder, onRenameFolder,
  onAddPhotosToFolder, onDeletePhotoFromFolder, onSetFolderCoverImage,
  onDeleteUser,
}) {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent]     = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  useEffect(() => {
    if (initialEventId) {
      const ev = userEvents.find((e) => e.id === initialEventId);
      if (ev) setSelectedEvent(ev);
      if (clearInitialEventId) clearInitialEventId();
    }
  }, [initialEventId, userEvents, clearInitialEventId]);

  if (selectedEvent) {
    const eventFolders = folders.filter((f) => f.eventId === selectedEvent.id);
    // Find the latest version of the event from parent
    const liveEvent = userEvents.find((e) => e.id === selectedEvent.id) ?? selectedEvent;
    return (
      <ErrorBoundary>
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
          onSetFolderCoverImage={onSetFolderCoverImage}
        />
      </ErrorBoundary>
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
      <div className="glass rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 border border-white/[0.05]">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          {(() => {
            let coverImg = null;
            for (const ev of userEvents) {
              const evFolders = folders.filter(f => f.eventId === ev.id);
              for (const f of evFolders) {
                if (f.coverImage) { coverImg = f.coverImage; break; }
                if (!coverImg && f.photos?.[0]?.url) { coverImg = f.photos[0].url; }
              }
              if (coverImg) break;
            }
            return coverImg ? (
              <img src={coverImg} alt={user.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                {initials(user.name)}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-lg">{user.name}</p>
            <p className="text-silver/50 text-sm flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5" />{user.phone}
            </p>
            <p className="text-silver/30 text-xs mt-1">Client since {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <button
          onClick={() => setDeleteTarget({ type: 'user', id: user.id })}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all sm:ml-auto"
        >
          <Trash2 className="w-4 h-4" /> Delete User
        </button>
      </div>

      {/* Events */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-0.5">Events</p>
          <h3 className="font-serif text-xl text-white font-light">
            {userEvents.length} event{userEvents.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Modals placed outside main flow for proper stacking */}
      <AnimatePresence>
        {showCreateEvent && (
          <CreateEventModal
            user={user}
            onSubmit={(ev) => { onAddEvent(ev); setShowCreateEvent(false); }}
            onCancel={() => setShowCreateEvent(false)}
          />
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
                      className="p-1.5 rounded-lg text-silver/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
                    if (deleteTarget.type === 'user') { navigate('/admin/users'); onDeleteUser(user.id); }
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
  onAddPhotosToFolder, onDeletePhotoFromFolder, onSetFolderCoverImage,
}) {
  const { eventId, userId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [initialEventId, setInitialEventId] = useState(null);

  useEffect(() => {
    if (eventId) {
      const ev = events.find(e => String(e.id) === String(eventId));
      if (ev) {
        const u = users.find(u => u.phone === ev.customerPhone);
        if (u) {
          setSelectedUser(u);
          setInitialEventId(ev.id);
        }
      }
    } else if (userId) {
      const u = users.find(u => String(u.id) === String(userId));
      if (u) {
        setSelectedUser(u);
        setInitialEventId(null);
      } else {
        setSelectedUser(null);
        setInitialEventId(null);
      }
    } else {
      setSelectedUser(null);
      setInitialEventId(null);
    }
  }, [eventId, userId, events, users]);

  if (selectedUser) {
    const userEvents = events.filter((e) => e.customerPhone === selectedUser.phone);
    // Keep selectedUser in sync if parent re-renders
    const liveUser = users.find((u) => u.id === selectedUser.id);
    if (!liveUser) { setSelectedUser(null); return null; }
    return (
      <UserDetail
        user={liveUser}
        userEvents={userEvents}
        folders={folders}
        initialEventId={initialEventId}
        clearInitialEventId={() => {}}
        onBack={() => navigate('/admin/users')}
        onAddEvent={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onUpdateEvent={onUpdateEvent}
        onAddFolder={onAddFolder}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
        onAddPhotosToFolder={onAddPhotosToFolder}
        onDeletePhotoFromFolder={onDeletePhotoFromFolder}
        onSetFolderCoverImage={onSetFolderCoverImage}
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
            const eventCount = events.filter((e) => e.customerPhone === user.phone).length;
            return (
              <motion.button
                key={user.id}
                layout
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="w-full glass rounded-xl px-5 py-4 flex items-center gap-4 text-left border border-white/[0.04] hover:border-gold/20 transition-all group"
              >
                {/* Avatar */}
                {(() => {
                  let coverImg = null;
                  const uEvents = events.filter(e => e.customerPhone === user.phone);
                  for (const ev of uEvents) {
                    const evFolders = folders.filter(f => f.eventId === ev.id);
                    for (const f of evFolders) {
                      if (f.coverImage) { coverImg = f.coverImage; break; }
                      if (!coverImg && f.photos?.[0]?.url) { coverImg = f.photos[0].url; }
                    }
                    if (coverImg) break;
                  }
                  return coverImg ? (
                    <img src={coverImg} alt={user.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-xs font-bold">{initials(user.name)}</span>
                    </div>
                  );
                })()}

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
                  <span>Since {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
