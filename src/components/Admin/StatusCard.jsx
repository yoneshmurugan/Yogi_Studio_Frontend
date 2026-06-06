import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

const statusColors = {
  active: { dot: 'bg-gold', text: 'text-gold', badge: 'bg-gold/10 border-gold/20' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-400/10 border-amber-400/20' },
  complete: { dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/20' },
};

export default function StatusCard({ event }) {
  const colors = statusColors[event.status] || statusColors.active;

  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-medium text-sm">{event.clientName}</h3>
          <p className="text-silver/60 text-xs mt-0.5">{event.eventName}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border ${colors.badge} ${colors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${event.status === 'active' ? 'animate-pulse' : ''}`} />
          {event.status}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-silver/50">Photos Selected</span>
          <span className="text-white font-mono">{event.selected} / {event.total}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gold-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${(event.selected / event.total) * 100}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="text-[11px] text-silver/40">{event.date}</p>
    </GlassCard>
  );
}
