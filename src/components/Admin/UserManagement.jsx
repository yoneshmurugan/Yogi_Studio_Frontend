import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Trash2, Copy, ChevronDown, ChevronUp,
  ExternalLink, Check, UserX
} from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const STATUS_FILTERS = ['All', 'pending', 'active', 'awaiting_approval', 'complete'];

const STATUS_META = {
  pending:           { label: 'Pending',            dot: 'bg-amber-400',   text: 'text-amber-400',  badge: 'bg-amber-400/10 border-amber-400/20' },
  active:            { label: 'Active',             dot: 'bg-gold',         text: 'text-gold',        badge: 'bg-gold/10 border-gold/20' },
  awaiting_approval: { label: 'Awaiting Approval', dot: 'bg-blue-400',    text: 'text-blue-400',   badge: 'bg-blue-400/10 border-blue-400/20' },
  complete:          { label: 'Complete',           dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/20' },
};

const PACKAGE_COLORS = {
  Essential: 'text-silver/70',
  Premium:   'text-gold',
  Elite:     'text-purple-400',
};

// ── Expandable row ────────────────────────────────────────────────────────────
function UserRow({ user, onDelete, onCopy, copiedId }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[user.status] ?? STATUS_META.active;
  const pct  = user.total > 0 ? Math.round((user.selected / user.total) * 100) : 0;
  const isCopied = copiedId === user.id;

  return (
    <motion.div layout className="glass rounded-xl overflow-hidden border border-white/[0.04] hover:border-white/[0.08] transition-all">
      {/* Main row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full grid grid-cols-12 gap-3 items-center px-5 py-4 text-left"
      >
        {/* Avatar + name */}
        <div className="col-span-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
            <span className="text-gold text-[10px] font-bold">
              {user.clientName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.clientName}</p>
            <p className="text-silver/40 text-xs truncate">{user.eventName}</p>
          </div>
        </div>

        {/* Date */}
        <div className="col-span-2 hidden md:block">
          <p className="text-silver/60 text-xs">{user.date}</p>
        </div>

        {/* Package */}
        <div className="col-span-1 hidden lg:block">
          <p className={`text-xs font-medium ${PACKAGE_COLORS[user.package] || 'text-silver/60'}`}>{user.package}</p>
        </div>

        {/* Progress */}
        <div className="col-span-2 hidden md:block">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-silver/40">Selected</span>
            <span className="text-white/70 font-mono">{user.selected}/{user.total}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full gold-gradient" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Status badge */}
        <div className="col-span-2 flex justify-end">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border ${meta.badge} ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${user.status === 'active' ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{meta.label}</span>
          </span>
        </div>

        {/* Expand icon */}
        <div className="col-span-1 flex justify-end">
          {expanded ? <ChevronUp className="w-4 h-4 text-silver/30" /> : <ChevronDown className="w-4 h-4 text-silver/30" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-white/[0.05]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                {[
                  ['Phone',     user.phone || '—'],
                  ['Email',     user.email || '—'],
                  ['Event Type', user.eventType],
                  ['Token',     user.accessToken],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-silver/40 block mb-0.5">{k}</span>
                    <span className="text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onCopy(user); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border
                    ${isCopied ? 'bg-gold/10 border-gold/20 text-gold' : 'bg-white/5 border-white/10 text-silver/60 hover:text-white hover:border-white/20'}`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(`/gallery/${user.accessToken}`, '_blank'); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-silver/60 hover:text-white hover:border-white/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Gallery
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Client
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserManagement({ users, onDeleteUser }) {
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedId, setCopiedId]     = useState(null);

  const handleCopy = (user) => {
    const url = `${window.location.origin}/gallery/${user.accessToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  const handleConfirmDelete = (id) => {
    onDeleteUser(id);
    setDeleteTarget(null);
  };

  const filtered = users.filter((u) => {
    const matchesStatus = filter === 'All' || u.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q
      || u.clientName.toLowerCase().includes(q)
      || u.eventName.toLowerCase().includes(q)
      || u.accessToken?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">Management</p>
        <h2 className="font-serif text-2xl text-white font-light">All Clients</h2>
        <p className="text-silver/40 text-sm mt-1">Search, filter, and manage all client events.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, event, or token…"
            className="w-full bg-charcoal/40 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-silver/25
              focus:outline-none focus:border-gold/40 transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <SlidersHorizontal className="w-4 h-4 text-silver/30 flex-shrink-0 self-center" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border
                ${filter === f
                  ? 'bg-gold/10 border-gold/30 text-gold'
                  : 'bg-transparent border-white/8 text-silver/50 hover:text-white hover:border-white/15'}`}
            >
              {f === 'All' ? 'All' : STATUS_META[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-silver/40 text-xs mb-4">
        Showing {filtered.length} of {users.length} client{users.length !== 1 ? 's' : ''}
      </p>

      {/* Table / card list */}
      {filtered.length > 0 ? (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {filtered.map((user) => (
              <motion.div
                key={user.id} layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <UserRow
                  user={user}
                  onDelete={setDeleteTarget}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center border border-white/[0.04]"
        >
          <UserX className="w-10 h-10 text-silver/20 mx-auto mb-3" />
          <p className="text-silver/50 text-sm">No clients match your search</p>
          <button onClick={() => { setSearch(''); setFilter('All'); }}
            className="mt-3 text-gold/60 text-xs hover:text-gold transition-colors">
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
