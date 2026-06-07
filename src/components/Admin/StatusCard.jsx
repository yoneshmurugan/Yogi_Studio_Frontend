import { motion } from 'framer-motion';
import { Copy, Trash2, ExternalLink } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const statusColors = {
  active:            { dot: 'bg-gold',         text: 'text-gold',         badge: 'bg-gold/10 border-gold/20' },
  pending:           { dot: 'bg-amber-400',    text: 'text-amber-400',    badge: 'bg-amber-400/10 border-amber-400/20' },
  awaiting_approval: { dot: 'bg-blue-400',     text: 'text-blue-400',     badge: 'bg-blue-400/10 border-blue-400/20' },
  complete:          { dot: 'bg-emerald-400',  text: 'text-emerald-400',  badge: 'bg-emerald-400/10 border-emerald-400/20' },
};

const statusLabels = {
  active: 'Active', pending: 'Pending', awaiting_approval: 'For Approval', complete: 'Complete',
};

export default function StatusCard({ event, onDelete, onCopy }) {
  const colors = statusColors[event.status] || statusColors.active;
  const pct = event.total > 0 ? (event.selected / event.total) * 100 : 0;

  return (
    <GlassCard hover>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-medium text-sm">{event.clientName}</h3>
          <p className="text-silver/60 text-xs mt-0.5">{event.eventName}</p>
          {event.eventType && (
            <p className="text-silver/30 text-[10px] mt-0.5 tracking-wide">{event.eventType}</p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border ${colors.badge} ${colors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${event.status === 'active' ? 'animate-pulse' : ''}`} />
          {statusLabels[event.status] ?? event.status}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-silver/50">Photos Selected</span>
          <span className="text-white font-mono">{event.selected} / {event.total}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gold-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-silver/40">{event.date}</p>

        {/* Quick actions */}
        <div className="flex gap-1">
          {onCopy && (
            <button onClick={() => onCopy(event)}
              className="p-1.5 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => window.open(`/gallery/${event.accessToken}`, '_blank')}
            className="p-1.5 rounded-lg text-silver/40 hover:text-white hover:bg-white/5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button onClick={() => onDelete(event)}
              className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
