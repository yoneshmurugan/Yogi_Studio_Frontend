import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CheckCircle, ImageIcon, TrendingUp, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
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

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'gold', delay = 0 }) {
  const colorMap = {
    gold:    { icon: 'text-gold',    bg: 'bg-gold/10',    border: 'border-gold/20' },
    amber:   { icon: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    blue:    { icon: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
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
      {/* subtle bg glow */}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full ${c.bg} blur-2xl opacity-50`} />
    </motion.div>
  );
}

// ── User status row card ──────────────────────────────────────────────────────
function UserStatusRow({ user, type }) {
  const [expanded, setExpanded] = useState(false);
  const pct = user.total > 0 ? Math.round((user.selected / user.total) * 100) : 0;

  return (
    <motion.div
      layout
      className="glass rounded-xl overflow-hidden border border-white/[0.05] hover:border-gold/20 transition-colors"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="text-gold text-xs font-bold">
            {user.clientName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{user.clientName}</p>
          <p className="text-silver/50 text-xs truncate">{user.eventName}</p>
        </div>
        {type === 'pending' ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 whitespace-nowrap">
            Not Started
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 whitespace-nowrap">
            {user.selected} Selected
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-silver/40 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-silver/40 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-silver/40">Event Type</span>
                  <p className="text-white mt-0.5">{user.eventType}</p>
                </div>
                <div>
                  <span className="text-silver/40">Package</span>
                  <p className="text-gold mt-0.5">{user.package}</p>
                </div>
                <div>
                  <span className="text-silver/40">Date</span>
                  <p className="text-white mt-0.5">{user.date}</p>
                </div>
                <div>
                  <span className="text-silver/40">Access Token</span>
                  <p className="text-white font-mono mt-0.5">{user.accessToken}</p>
                </div>
              </div>
              {/* progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-silver/50">Photos Selected</span>
                  <span className="text-white font-mono">{user.selected} / {user.total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminOverview({ users, onNavigate }) {
  const total       = users.length;
  const pending     = users.filter((u) => u.status === 'pending').length;
  const awaitApproval = users.filter((u) => u.status === 'awaiting_approval').length;
  const complete    = users.filter((u) => u.status === 'complete').length;
  const totalPhotos = users.reduce((s, u) => s + u.total, 0);

  const pendingUsers   = users.filter((u) => u.status === 'pending');
  const approvalUsers  = users.filter((u) => u.status === 'awaiting_approval');

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}      label="Total Clients"      value={total}          sub="All time"           color="gold"    delay={0} />
        <KpiCard icon={Clock}      label="Awaiting Selection" value={pending}        sub="Need to choose photos" color="amber" delay={0.1} />
        <KpiCard icon={TrendingUp} label="Awaiting Approval"  value={awaitApproval}  sub="Ready for review"   color="blue"    delay={0.2} />
        <KpiCard icon={ImageIcon}  label="Total Photos"       value={totalPhotos}    sub="Uploaded across events" color="emerald" delay={0.3} />
      </div>

      {/* Dual-Stream Status Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left — Awaiting Selection */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-amber-400/80 text-[10px] tracking-[0.35em] uppercase mb-1">Action Required</p>
              <h2 className="font-serif text-xl text-white font-light">Awaiting Selection</h2>
              <p className="text-silver/40 text-xs mt-0.5">Customers haven't chosen their photos yet</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-sm font-mono">
              {pendingUsers.length}
            </span>
          </div>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {pendingUsers.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-silver/40 text-sm">All clients have started selecting</p>
              </div>
            ) : (
              pendingUsers.map((u) => (
                <motion.div key={u.id} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                  <UserStatusRow user={u} type="pending" />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Right — Awaiting Admin Approval */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-400/80 text-[10px] tracking-[0.35em] uppercase mb-1">Ready to Review</p>
              <h2 className="font-serif text-xl text-white font-light">Awaiting Approval</h2>
              <p className="text-silver/40 text-xs mt-0.5">Selections made — your approval needed</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 text-sm font-mono">
              {approvalUsers.length}
            </span>
          </div>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {approvalUsers.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-silver/40 text-sm">No pending approvals</p>
              </div>
            ) : (
              approvalUsers.map((u) => (
                <motion.div key={u.id} variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}>
                  <UserStatusRow user={u} type="approval" />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick action strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Create New Event', sub: 'Add a client & upload photos', tab: 'create', color: 'from-gold/20 to-gold/5', border: 'border-gold/20' },
          { label: 'Manage Portfolio', sub: 'Update landing page content',  tab: 'portfolio', color: 'from-purple-500/15 to-purple-500/5', border: 'border-purple-500/20' },
          { label: 'All Users',        sub: 'Search, filter & manage',      tab: 'users',    color: 'from-emerald-500/15 to-emerald-500/5', border: 'border-emerald-500/20' },
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
