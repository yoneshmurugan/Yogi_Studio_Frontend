import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, UserPlus, Images, Users,
  ChevronLeft, ChevronRight, LogOut, Camera, Menu, X
} from 'lucide-react';
import AdminOverview    from './AdminOverview';
import AddUserSection   from './AddUserSection';
import PortfolioManager from './PortfolioManager';
import UserManagement   from './UserManagement';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import yogiLogo from '../../assets/yogi-logo.jpg';

// ── Seed data ─────────────────────────────────────────────────────────────────
export const seedUsers = [
  { id: 1, name: 'Sarah Henderson', phone: '+91 98765 43210', createdAt: '2026-01-15', status: 'active' },
  { id: 2, name: 'Raj Mehta',       phone: '+91 87654 32109', createdAt: '2026-02-20', status: 'active' },
  { id: 3, name: 'Olivia Park',     phone: '+91 76543 21098', createdAt: '2026-03-10', status: 'active' },
];

export const seedEvents = [
  { id: 1, userId: 1, eventName: 'The Henderson Wedding', category: 'Wedding',     date: '2026-10-14', notes: 'Beach ceremony at sunset.', accessToken: 'SJH-7842', status: 'awaiting_approval', downloadedAt: null },
  { id: 2, userId: 1, eventName: 'Pre-Wedding Shoot',     category: 'Engagement',  date: '2026-09-01', notes: '',                          accessToken: 'SJH-PRE1', status: 'complete',           downloadedAt: '2026-09-10' },
  { id: 3, userId: 2, eventName: 'Executive Headshots',   category: 'Portrait',    date: '2026-11-20', notes: '',                          accessToken: 'RM-4487',  status: 'active',             downloadedAt: null },
  { id: 4, userId: 3, eventName: 'Rooftop Celebration',   category: 'Corporate',   date: '2026-09-28', notes: '',                          accessToken: 'ODP-9910', status: 'pending',            downloadedAt: null },
];

export const seedFolders = [
  { id: 1, eventId: 1, name: 'Ceremony',      photos: [] },
  { id: 2, eventId: 1, name: 'Reception',     photos: [] },
  { id: 3, eventId: 2, name: 'Outdoor Shoot', photos: [] },
  { id: 4, eventId: 3, name: 'Studio Shots',  photos: [] },
];

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'overview',  label: 'Dashboard', icon: LayoutDashboard },
  { id: 'adduser',   label: 'Add User',  icon: UserPlus },
  { id: 'portfolio', label: 'Portfolio', icon: Images },
  { id: 'users',     label: 'Users',     icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Extract 'overview', 'users', etc. from the URL
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'overview';

  // ── Shared state ─────────────────────────────────────────────────────────
  const [users,   setUsers]   = useState([]);
  const [events,  setEvents]  = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/events`)
        ]);
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const fetchedEvents = eventsData.events || [];
          
          setEvents(fetchedEvents);
          
          // Flatten nested folders from events to match frontend flat-state
          const allFolders = [];
          fetchedEvents.forEach(ev => {
            if (ev.folders) {
              ev.folders.forEach(f => {
                allFolders.push({ ...f, eventId: ev.id });
              });
            }
          });
          setFolders(allFolders);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Users
  const addUser    = (u)  => setUsers((p) => [u, ...p]);
  const deleteUser = async (id) => {
    console.log("Starting deleteUser for id:", id);
    const userToDel = users.find(u => String(u.id) === String(id));
    if (!userToDel) {
      console.log("userToDel NOT FOUND!");
      return;
    }
    console.log("userToDel found:", userToDel);

    // Cascade delete all photos in Firebase Storage for this user's events
    const evIds = events.filter((e) => e.customerPhone === userToDel.phone).map((e) => e.id);
    const userFolders = folders.filter((f) => evIds.includes(f.eventId));
    for (const folder of userFolders) {
      if (folder.photos && folder.photos.length > 0) {
        for (const ph of folder.photos) {
          try { 
            console.log("Deleting photo:", ph.id);
            await deleteObject(ref(storage, `events/folders/${folder.id}/${ph.id}`)); 
          } catch(e) { 
            console.error("Failed to delete photo:", e); 
          }
        }
      }
    }

    console.log("Finished deleting photos. Now sending DELETE fetch to backend...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${encodeURIComponent(userToDel.phone)}`, {
        method: 'DELETE'
      });
      console.log("Delete response status:", res.status);
      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((p) => p.filter((u) => String(u.id) !== String(id)));
      setEvents((p) => p.filter((e) => e.customerPhone !== userToDel.phone));
      setFolders((p) => p.filter((f) => !evIds.includes(f.eventId)));
    } catch (err) {
      console.error(err);
      alert("Error deleting user: " + err.message);
    }
  };

  // Events
  const addEvent = async (eventPayload) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newEvent = { ...data.event };
      setEvents((p) => [newEvent, ...p]);
    } catch (err) {
      console.error("Failed to add event:", err);
      alert("Error adding event: " + err.message);
    }
  };
  const deleteEvent = async (id) => {
    const eventToDel = events.find(e => String(e.id) === String(id));
    if (!eventToDel) return;

    // Cascade delete all photos in Firebase Storage for this event
    const eventFolders = folders.filter(f => f.eventId === id);
    for (const folder of eventFolders) {
      if (folder.photos && folder.photos.length > 0) {
        for (const ph of folder.photos) {
          try { await deleteObject(ref(storage, `events/folders/${folder.id}/${ph.id}`)); } catch(e) { console.error(e); }
        }
      }
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/events/${id}?phone=${encodeURIComponent(eventToDel.customerPhone)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete event");

      setEvents((p) => p.filter((e) => String(e.id) !== String(id)));
      setFolders((p) => p.filter((f) => String(f.eventId) !== String(id)));
    } catch (err) {
      console.error(err);
      alert("Error deleting event: " + err.message);
    }
  };
  const updateEvent = async (id, patch) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/events/${id}?phone=${encodeURIComponent(ev.customerPhone)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch(err) { console.error("Event patch error", err); }
  };

  // Folders & Photos - Sync to Backend
  const syncEventFolders = async (eventId, newFlatFolders) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    const eventFolders = newFlatFolders.filter(f => f.eventId === eventId);
    
    // Update local events state to keep it in sync
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, folders: eventFolders } : e));

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/events/${eventId}?phone=${encodeURIComponent(ev.customerPhone)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: eventFolders })
      });
    } catch(err) { console.error("Folder sync error:", err); }
  };

  const addFolder = (f) => {
    const newFolders = [...folders, f];
    setFolders(newFolders);
    syncEventFolders(f.eventId, newFolders);
  };

  const deleteFolder = async (id) => {
    const folderToDel = folders.find(f => String(f.id) === String(id));
    if (!folderToDel) return;

    // Delete all photos in the folder from Firebase Storage
    if (folderToDel.photos && folderToDel.photos.length > 0) {
      for (const ph of folderToDel.photos) {
        try {
          const photoRef = ref(storage, `events/folders/${id}/${ph.id}`);
          await deleteObject(photoRef);
        } catch (err) {
          console.error("Error deleting photo from storage:", err);
        }
      }
    }

    const newFolders = folders.filter((f) => String(f.id) !== String(id));
    setFolders(newFolders);
    syncEventFolders(folderToDel.eventId, newFolders);
  };

  const renameFolder = (id, name) => {
    const folderToEdit = folders.find(f => String(f.id) === String(id));
    if (!folderToEdit) return;
    const newFolders = folders.map((f) => (String(f.id) === String(id) ? { ...f, name } : f));
    setFolders(newFolders);
    syncEventFolders(folderToEdit.eventId, newFolders);
  };

  const addPhotosToFolder = (folderId, photos) => {
    const folderToEdit = folders.find(f => String(f.id) === String(folderId));
    if (!folderToEdit) return;
    const newFolders = folders.map((f) => (String(f.id) === String(folderId) ? { ...f, photos: [...f.photos, ...photos] } : f));
    setFolders(newFolders);
    syncEventFolders(folderToEdit.eventId, newFolders);
  };

  const setFolderCoverImage = (folderId, photoUrl) => {
    const folderToEdit = folders.find(f => String(f.id) === String(folderId));
    if (!folderToEdit) return;
    const newFolders = folders.map((f) => (String(f.id) === String(folderId) ? { ...f, coverImage: photoUrl } : f));
    setFolders(newFolders);
    syncEventFolders(folderToEdit.eventId, newFolders);
  };

  const deletePhotoFromFolder = async (folderId, photoId) => {
    const folderToEdit = folders.find(f => String(f.id) === String(folderId));
    if (!folderToEdit) return;

    // Delete single photo from Firebase Storage
    try {
      const photoRef = ref(storage, `events/folders/${folderId}/${photoId}`);
      await deleteObject(photoRef);
    } catch (err) {
      console.error("Error deleting photo from storage:", err);
    }

    const newFolders = folders.map((f) =>
      String(f.id) === String(folderId) ? { ...f, photos: f.photos.filter((ph) => ph.id !== photoId) } : f
    );
    setFolders(newFolders);
    syncEventFolders(folderToEdit.eventId, newFolders);
  };

  const currentLabel = navItems.find((n) => n.id === activeTab)?.label ?? '';

  const SidebarContent = ({ isMobile }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-4 py-6 border-b border-white/[0.06] overflow-hidden shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
            <img src={yogiLogo} alt="Yogi Studio" className="w-full h-full object-cover" />
          </div>
          <AnimatePresence>
            {(sidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-white font-serif text-sm font-light whitespace-nowrap">Yogi Studio</p>
                <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase whitespace-nowrap">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-silver/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => {
                navigate(`/admin/${id}`);
                if (isMobile) setMobileMenuOpen(false);
              }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                ${active
                  ? 'bg-gold/10 border border-gold/20 text-gold'
                  : 'text-silver/50 hover:text-white hover:bg-white/[0.04] border border-transparent'}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-gold' : ''}`} />
              <AnimatePresence>
                {(sidebarOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle (Desktop only) */}
      {!isMobile && (
        <div className="px-2 pb-4 shrink-0">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-silver/30 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            {sidebarOpen
              ? <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              : <ChevronRight className="w-5 h-5 flex-shrink-0" />}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#050505]">

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#0B0B0B] relative z-20 overflow-hidden"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#0B0B0B] border-r border-white/[0.06] z-50 flex flex-col shadow-2xl md:hidden"
            >
              <SidebarContent isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">

        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-sm flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-silver/60 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-0.5 hidden sm:block">Studio Control</p>
              <h1 className="font-serif text-lg md:text-xl text-white font-light">{currentLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm">Admin</p>
              <p className="text-silver/40 text-xs">Yogi Studio</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
              <img src={yogiLogo} alt="Admin Profile" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => navigate('/')} className="p-2 ml-1 md:ml-0 rounded-lg text-silver/40 hover:text-white hover:bg-white/[0.05] transition-colors">
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-4 md:p-8"
            >
              <Routes location={location} key={location.pathname}>
                <Route path="overview" element={
                  <AdminOverview
                    users={users}
                    events={events}
                    folders={folders}
                    onNavigate={(id) => navigate(`/admin/${id}`)}
                    onNavigateEvent={(id) => navigate(`/admin/users/event/${id}`)}
                  />
                } />
                <Route path="adduser" element={
                  <AddUserSection
                    onUserAdded={(u) => { addUser(u); navigate('/admin/users'); }}
                  />
                } />
                <Route path="portfolio" element={<PortfolioManager />} />
                <Route path="users" element={
                  <UserManagement
                    users={users}
                    events={events}
                    folders={folders}
                    onDeleteUser={deleteUser}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                    onAddFolder={addFolder}
                    onDeleteFolder={deleteFolder}
                    onRenameFolder={renameFolder}
                    onSetFolderCoverImage={setFolderCoverImage}
                    onAddPhotosToFolder={addPhotosToFolder}
                    onDeletePhotoFromFolder={deletePhotoFromFolder}
                  />
                } />
                <Route path="users/event/:eventId" element={
                  <UserManagement
                    users={users}
                    events={events}
                    folders={folders}
                    onDeleteUser={deleteUser}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                    onAddFolder={addFolder}
                    onDeleteFolder={deleteFolder}
                    onRenameFolder={renameFolder}
                    onSetFolderCoverImage={setFolderCoverImage}
                    onAddPhotosToFolder={addPhotosToFolder}
                    onDeletePhotoFromFolder={deletePhotoFromFolder}
                  />
                } />
                <Route path="users/:userId" element={
                  <UserManagement
                    users={users}
                    events={events}
                    folders={folders}
                    onDeleteUser={deleteUser}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                    onAddFolder={addFolder}
                    onDeleteFolder={deleteFolder}
                    onRenameFolder={renameFolder}
                    onSetFolderCoverImage={setFolderCoverImage}
                    onAddPhotosToFolder={addPhotosToFolder}
                    onDeletePhotoFromFolder={deletePhotoFromFolder}
                  />
                } />
                <Route path="*" element={<Navigate to="overview" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
