import { motion } from 'framer-motion';
import StatusCard from './StatusCard';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StatusMatrix({ events = [], onDelete, onCopy }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gold/80 text-xs tracking-[0.3em] uppercase mb-1">Status Matrix</p>
          <h3 className="font-serif text-2xl text-white">Active Events</h3>
        </div>
        <span className="text-xs text-silver/40 font-mono">{events.length} events</span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {events.map((event) => (
          <motion.div key={event.id} variants={item}>
            <StatusCard event={event} onDelete={onDelete} onCopy={onCopy} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
