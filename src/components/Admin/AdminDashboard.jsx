import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserPlus, Images, Users,
  ChevronLeft, ChevronRight, LogOut, Camera,
} from 'lucide-react';
import AdminOverview    from './AdminOverview';
import AddUserSection   from './AddUserSection';
import PortfolioManager from './PortfolioManager';
import UserManagement   from './UserManagement';

// ── Seed data ─────────────────────────────────────────────────────────────────
export const seedUsers = [
  { id: 1, name: 'Sarah Henderson', phone: '+91 98765 43210', createdAt: '2026-01-15', status: 'active' },
  { id: 2, name: 'Raj Mehta',       phone: '+91 87654 32109', createdAt: '2026-02-20', status: 'active' },
  { id: 3, name: 'Olivia Park',     phone: '+91 76543 21098', createdAt: '2026-03-10', status: 'active' },
];

export const seedEvents = [
  { id: 1, userId: 1, eventName: 'The Henderson Wedding', category: 'Wedding',     date: '2026-10-14', package: 'Elite',      notes: 'Beach ceremony at sunset.', accessToken: 'SJH-7842', status: 'awaiting_approval', downloadedAt: null },
  { id: 2, userId: 1, eventName: 'Pre-Wedding Shoot',     category: 'Engagement',  date: '2026-09-01', package: 'Premium',    notes: '',                          accessToken: 'SJH-PRE1', status: 'complete',           downloadedAt: '2026-09-10' },
  { id: 3, userId: 2, eventName: 'Executive Headshots',   category: 'Portrait',    date: '2026-11-20', package: 'Essential',  notes: '',                          accessToken: 'RM-4487',  status: 'active',             downloadedAt: null },
  { id: 4, userId: 3, eventName: 'Rooftop Celebration',   category: 'Corporate',   date: '2026-09-28', package: 'Premium',    notes: '',                          accessToken: 'ODP-9910', status: 'pending',            downloadedAt: null },
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
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Shared state ─────────────────────────────────────────────────────────
  const [users,   setUsers]   = useState(seedUsers);
  const [events,  setEvents]  = useState(seedEvents);
  const [folders, setFolders] = useState(seedFolders);

  // Users
  const addUser    = (u)  => setUsers((p) => [u, ...p]);
  const deleteUser = (id) => {
    setUsers((p) => p.filter((u) => u.id !== id));
    const evIds = events.filter((e) => e.userId === id).map((e) => e.id);
    setEvents((p) => p.filter((e) => e.userId !== id));
    setFolders((p) => p.filter((f) => !evIds.includes(f.eventId)));
  };

  // Events
  const addEvent    = (ev) => setEvents((p) => [ev, ...p]);
  const deleteEvent = (id) => {
    setEvents((p) => p.filter((e) => e.id !== id));
    setFolders((p) => p.filter((f) => f.eventId !== id));
  };
  const updateEvent = (id, patch) =>
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // Folders
  const addFolder   = (f)  => setFolders((p) => [...p, f]);
  const deleteFolder = (id) => setFolders((p) => p.filter((f) => f.id !== id));
  const renameFolder = (id, name) =>
    setFolders((p) => p.map((f) => (f.id === id ? { ...f, name } : f)));
  const addPhotosToFolder = (folderId, photos) =>
    setFolders((p) =>
      p.map((f) => (f.id === folderId ? { ...f, photos: [...f.photos, ...photos] } : f))
    );
  const deletePhotoFromFolder = (folderId, photoId) =>
    setFolders((p) =>
      p.map((f) =>
        f.id === folderId ? { ...f, photos: f.photos.filter((ph) => ph.id !== photoId) } : f
      )
    );

  const currentLabel = navItems.find((n) => n.id === activeTab)?.label ?? '';

  return (
    <div className="flex min-h-screen bg-[#050505]">

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0B0B0B] relative z-20 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06] overflow-hidden">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-black" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
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

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id)}
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
                  {sidebarOpen && (
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

        {/* Collapse toggle */}
        <div className="px-2 pb-4">
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
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-sm flex-shrink-0">
          <div>
            <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-0.5">Studio Control</p>
            <h1 className="font-serif text-xl text-white font-light">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white text-sm">Admin</p>
              <p className="text-silver/40 text-xs">Yogi Nesh</p>
            </div>
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-black text-sm font-bold">YN</span>
            </div>
            <button className="p-2 rounded-lg text-silver/40 hover:text-white hover:bg-white/[0.05] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-8"
            >
              {activeTab === 'overview' && (
                <AdminOverview
                  users={users}
                  events={events}
                  folders={folders}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'adduser' && (
                <AddUserSection
                  onUserAdded={(u) => { addUser(u); setActiveTab('users'); }}
                />
              )}
              {activeTab === 'portfolio' && <PortfolioManager />}
              {activeTab === 'users' && (
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
                  onAddPhotosToFolder={addPhotosToFolder}
                  onDeletePhotoFromFolder={deletePhotoFromFolder}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
