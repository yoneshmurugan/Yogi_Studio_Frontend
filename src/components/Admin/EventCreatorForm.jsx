import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Tag } from 'lucide-react';
import GoldButton from '../ui/GoldButton';
import DragDropZone from './DragDropZone';

export default function EventCreatorForm({ onEventCreated }) {
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !eventName) return;

    const token = btoa(`${clientName}-${Date.now()}`).slice(0, 16);
    const url = `${window.location.origin}/gallery/${token}`;

    onEventCreated?.({ clientName, eventName, eventDate, token, url });
    setClientName('');
    setEventName('');
    setEventDate('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      <div>
        <p className="text-gold/80 text-xs tracking-[0.3em] uppercase mb-6">Create Event</p>
      </div>

      {/* Client Name */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input
          type="text"
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full bg-charcoal/50 border border-white/8 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Event Name */}
      <div className="relative">
        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full bg-charcoal/50 border border-white/8 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Event Date */}
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full bg-charcoal/50 border border-white/8 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/40 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Drag and Drop */}
      <DragDropZone onFilesAdded={(files) => console.log('Files:', files)} />

      {/* Submit */}
      <div className="pt-2">
        <GoldButton
          type="submit"
          disabled={!clientName || !eventName}
          className="w-full"
        >
          Create Event
        </GoldButton>
      </div>
    </motion.form>
  );
}
