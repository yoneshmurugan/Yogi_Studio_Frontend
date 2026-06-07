import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, Images, Users,
  ChevronLeft, ChevronRight, LogOut, Camera
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import EventCreatorSection from './EventCreatorSection';
import PortfolioManager from './PortfolioManager';
import UserManagement from './UserManagement';

// ── Shared mock data ────────────────────────────────────────────────────────
export const mockUsers = [
  {
    id: 1, clientName: 'Sarah & James Henderson', phone: '+1 555-0101',
    email: 'sarah@example.com', eventName: 'The Henderson Wedding',
    eventType: 'Wedding', package: 'Elite', date: 'Oct 14, 2026',
    status: 'pending', selected: 0, total: 200, accessToken: 'SJH-7842',
  },
  {
    id: 2, clientName: 'Emily & Michael Torres', phone: '+1 555-0182',
    email: 'emily@example.com', eventName: 'Sunset Garden Ceremony',
    eventType: 'Wedding', package: 'Premium', date: 'Nov 2, 2026',
    status: 'awaiting_approval', selected: 87, total: 150, accessToken: 'EMT-3391',
  },
  {
    id: 3, clientName: 'Olivia & Daniel Park', phone: '+1 555-0247',
    email: 'olivia@example.com', eventName: 'Rooftop Celebration',
    eventType: 'Corporate', package: 'Premium', date: 'Sep 28, 2026',
    status: 'complete', selected: 120, total: 120, accessToken: 'ODP-9910',
  },
  {
    id: 4, clientName: 'Sophia & William Blake', phone: '+1 555-0308',
    email: 'sophia@example.com', eventName: 'Vineyard Romance',
    eventType: 'Wedding', package: 'Elite', date: 'Dec 5, 2026',
    status: 'active', selected: 45, total: 180, accessToken: 'SWB-6621',
  },
  {
    id: 5, clientName: 'Raj Mehta', phone: '+1 555-0439',
    email: 'raj@example.com', eventName: 'Executive Headshots',
    eventType: 'Portrait', package: 'Essential', date: 'Nov 20, 2026',
    status: 'awaiting_approval', selected: 12, total: 30, accessToken: 'RM-4487',
  },
  {
    id: 6, clientName: 'Clara & Luca Romano', phone: '+1 555-0574',
    email: 'clara@example.com', eventName: 'Villa Garden Vows',
    eventType: 'Wedding', package: 'Elite', date: 'Jan 10, 2027',
    status: 'pending', selected: 0, total: 250, accessToken: 'CLR-2231',
  },
];

// ── Nav items ───────────────────────────────────────────────────────────────
const navItems = [
  { id: 'overview',   label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'create',     label: 'Create Event',      icon: PlusCircle },
  { id: 'portfolio',  label: 'Portfolio',         icon: Images },
  { id: 'users',      label: 'User Management',   icon: Users },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState(mockUsers);

  const handleDeleteUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));
  const handleAddUser = (user) => setUsers((prev) => [user, ...prev]);

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
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            )}
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-sm">
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
              {activeTab === 'overview'  && <AdminOverview users={users} onNavigate={setActiveTab} />}
              {activeTab === 'create'    && <EventCreatorSection onUserAdded={handleAddUser} />}
              {activeTab === 'portfolio' && <PortfolioManager />}
              {activeTab === 'users'     && <UserManagement users={users} onDeleteUser={handleDeleteUser} onNavigate={setActiveTab} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
