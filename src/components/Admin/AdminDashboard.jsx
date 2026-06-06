import { useState } from 'react';
import { motion } from 'framer-motion';
import EventCreatorForm from './EventCreatorForm';
import AccessPassCard from './AccessPassCard';
import StatusMatrix from './StatusMatrix';
import GlassCard from '../ui/GlassCard';

export default function AdminDashboard() {
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleEventCreated = (eventData) => {
    setGeneratedUrl(eventData.url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Dashboard</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white">
          Studio Control
        </h1>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <GlassCard hover={false}>
            <EventCreatorForm onEventCreated={handleEventCreated} />
          </GlassCard>
        </div>

        {/* Right: Access Pass */}
        <div className="lg:col-span-3">
          {generatedUrl ? (
            <AccessPassCard url={generatedUrl} />
          ) : (
            <div className="glass rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full border border-white/8 flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full border border-dashed border-gold/30" />
              </div>
              <p className="text-silver/40 text-sm">Create an event to generate</p>
              <p className="text-silver/40 text-sm">a client access pass</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Matrix */}
      <StatusMatrix />
    </motion.div>
  );
}
