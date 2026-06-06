import { motion } from 'framer-motion';
import StatusCard from './StatusCard';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const demoEvents = [
  { id: 1, clientName: 'Sarah & James', eventName: 'The Henderson Wedding', date: 'Oct 14, 2026', status: 'active', selected: 45, total: 200 },
  { id: 2, clientName: 'Emily & Michael', eventName: 'Sunset Garden Ceremony', date: 'Nov 2, 2026', status: 'pending', selected: 0, total: 150 },
  { id: 3, clientName: 'Olivia & Daniel', eventName: 'Rooftop Celebration', date: 'Sep 28, 2026', status: 'complete', selected: 120, total: 120 },
  { id: 4, clientName: 'Sophia & William', eventName: 'Vineyard Romance', date: 'Dec 5, 2026', status: 'active', selected: 87, total: 180 },
];

export default function StatusMatrix() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gold/80 text-xs tracking-[0.3em] uppercase mb-1">Status Matrix</p>
          <h3 className="font-serif text-2xl text-white">Active Events</h3>
        </div>
        <span className="text-xs text-silver/40 font-mono">{demoEvents.length} events</span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {demoEvents.map((event) => (
          <motion.div key={event.id} variants={item}>
            <StatusCard event={event} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
