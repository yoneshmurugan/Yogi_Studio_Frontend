import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Camera, Clock, CheckCircle, ImageIcon,
  TrendingUp, ArrowRight, ChevronDown, ChevronUp, FolderOpen,
} from 'lucide-react';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{current}</span>;
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'gold', delay = 0 }) {
  const colorMap = {
    gold:    { icon: 'text-gold',         bg: 'bg-gold/10',         border: 'border-gold/20' },
    amber:   { icon: 'text-amber-400',    bg: 'bg-amber-400/10',    border: 'border-amber-400/20' },
    emerald: { icon: 'text-emerald-400',  bg: 'bg-emerald-400/10',  border: 'border-emerald-400/20' },
    blue:    { icon: 'text-blue-400',     bg: 'bg-blue-400/10',     border: 'border-blue-400/20' },
  };
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass rounded-2xl p-5 border ${c.border} relative overflow-hidden`}
    >
      <div className={`inline-flex p-2.5 rounded-xl ${c.bg} mb-4`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-3xl font-serif text-white font-light mb-1">
        <AnimatedNumber target={value} />
      </p>
      <p className="text-silver/70 text-sm">{label}</p>
      {sub && <p className="text-silver/40 text-xs mt-1">{sub}</p>}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full ${c.bg} blur-2xl opacity-50`} />
    </motion.div>
  );
}

function RecentEventRow({ event, userName, folders, onNavigateEvent }) {
  const STATUS_META = {
    pending:           { label: 'Draft',             cls: 'bg-white/5 text-silver/50 border-white/10' },
    active:            { label: 'Ready for Client',  cls: 'bg-gold/10 text-gold border-gold/20', pulse: true },
    awaiting_approval: { label: 'Done Selection',    cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
    complete:          { label: 'Reviewed',          cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
    downloaded:        { label: 'Downloaded',        cls: 'bg-purple-400/10 text-purple-400 border-purple-400/20' },
  };
  const m = STATUS_META[event.status] ?? STATUS_META.pending;

  return (
    <motion.div
      layout
      className="glass rounded-xl overflow-hidden border border-white/[0.05] hover:border-gold/20 transition-colors group"
    >
      <button
        onClick={() => onNavigateEvent && onNavigateEvent(event.id)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {(() => {
          let coverImg = null;
          const evFolders = folders?.filter(f => f.eventId === event.id) || [];
          for (const f of evFolders) {
            if (f.coverImage) { coverImg = f.coverImage; break; }
            if (!coverImg && f.photos?.[0]?.url) { coverImg = f.photos[0].url; }
          }
          return coverImg ? (
            <img src={coverImg} alt={event.eventName} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-gold/70" />
            </div>
          );
        })()}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{event.eventName}</p>
          <p className="text-silver/50 text-xs truncate">{userName} · {event.category}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border ${m.cls} flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current ${m.pulse ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">{m.label}</span>
        </span>
        <ArrowRight className="w-4 h-4 text-silver/40 flex-shrink-0 group-hover:text-gold transition-colors group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminOverview({ users, events, folders, onNavigate, onNavigateEvent }) {
  const totalUsers    = users.length;
  const totalEvents   = events.length;
  const awaitApproval = events.filter((e) => e.status === 'awaiting_approval').length;
  const totalPhotos   = folders.reduce((s, f) => s + f.photos.length, 0);

  const inProgressEvents = [...events]
    .filter((e) => e.status === 'pending' || e.status === 'active')
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}     label="Total Users"       value={totalUsers}    sub="Registered clients"         color="gold"    delay={0} />
        <KpiCard icon={Camera}    label="Total Events"      value={totalEvents}   sub="Across all users"           color="amber"   delay={0.1} />
        <KpiCard icon={CheckCircle} label="Done Selection" value={awaitApproval} sub="Needs review"           color="blue"    delay={0.2} />
        <KpiCard icon={ImageIcon} label="Photos Uploaded"   value={totalPhotos}   sub="Across all folders"         color="emerald" delay={0.3} />
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left — Awaiting Approval */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-400/80 text-[10px] tracking-[0.35em] uppercase mb-1">Done Selection</p>
              <h2 className="font-serif text-xl text-white font-light">Needs Review</h2>
              <p className="text-silver/40 text-xs mt-0.5">Client selections pending your download</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 text-sm font-mono">
              {awaitApproval}
            </span>
          </div>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {events.filter((e) => e.status === 'awaiting_approval').length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-silver/40 text-sm">No pending approvals</p>
              </div>
            ) : (
              events
                .filter((e) => e.status === 'awaiting_approval')
                .map((ev) => {
                  const user = users.find((u) => u.phone === ev.customerPhone);
                  return (
                    <motion.div key={ev.id} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                      <RecentEventRow event={ev} userName={user?.name ?? '—'} folders={folders} onNavigateEvent={onNavigateEvent} />
                    </motion.div>
                  );
                })
            )}
          </motion.div>
        </div>

        {/* Right — Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-amber-400/80 text-[10px] tracking-[0.35em] uppercase mb-1">In Progress</p>
              <h2 className="font-serif text-xl text-white font-light">Unfinalised Events</h2>
              <p className="text-silver/40 text-xs mt-0.5">Events still awaiting client selection</p>
            </div>
          </div>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {inProgressEvents.map((ev) => {
              const user = users.find((u) => u.phone === ev.customerPhone);
              return (
                <motion.div key={ev.id} variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}>
                  <RecentEventRow event={ev} userName={user?.name ?? '—'} folders={folders} onNavigateEvent={onNavigateEvent} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Add New User',    sub: 'Register a client with OTP',  tab: 'adduser',   color: 'from-gold/20 to-gold/5',            border: 'border-gold/20' },
          { label: 'Manage Portfolio',sub: 'Update landing page content',  tab: 'portfolio', color: 'from-purple-500/15 to-purple-500/5', border: 'border-purple-500/20' },
          { label: 'All Users',       sub: 'Search, manage & create events', tab: 'users',  color: 'from-emerald-500/15 to-emerald-500/5', border: 'border-emerald-500/20' },
        ].map(({ label, sub, tab, color, border }) => (
          <motion.button
            key={tab}
            onClick={() => onNavigate(tab)}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`glass rounded-2xl p-5 text-left bg-gradient-to-br ${color} border ${border} group transition-all duration-200`}
          >
            <p className="text-white font-medium text-sm mb-1">{label}</p>
            <p className="text-silver/50 text-xs">{sub}</p>
            <ArrowRight className="w-4 h-4 text-silver/30 group-hover:text-gold group-hover:translate-x-1 transition-all mt-3" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
