import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, Tag, Phone, Sparkles, ChevronDown
} from 'lucide-react';
import GoldButton from '../ui/GoldButton';
import DragDropZone from './DragDropZone';
import AccessPassCard from './AccessPassCard';

const EVENT_TYPES = ['Wedding', 'Portrait', 'Corporate', 'Engagement', 'Other'];
const PACKAGES = [
  { id: 'essential', label: 'Essential', sub: 'Up to 50 photos', color: 'border-silver/20 text-silver hover:border-silver/40' },
  { id: 'premium',   label: 'Premium',   sub: 'Up to 150 photos', color: 'border-gold/30 text-gold hover:border-gold/60' },
  { id: 'elite',     label: 'Elite',     sub: 'Unlimited photos', color: 'border-purple-400/30 text-purple-400 hover:border-purple-400/60' },
];

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="relative">
      <label className="block text-silver/50 text-[10px] tracking-[0.2em] uppercase mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-charcoal/40 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-silver/25
            focus:outline-none focus:border-gold/40 focus:bg-charcoal/60 transition-all [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

export default function EventCreatorSection({ onUserAdded }) {
  const [form, setForm] = useState({
    clientName: '', eventName: '', date: '', phone: '', email: '', eventType: '', package: '', photoLimit: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [step, setStep]= useState(1); // 1=details, 2=upload, 3=pass

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientName || !form.eventName || !form.package) return;

    const token = btoa(`${form.clientName}-${Date.now()}`).slice(0, 16).replace(/[^a-zA-Z0-9]/g, 'X');
    const url   = `${window.location.origin}/gallery/${token}`;

    const newUser = {
      id: Date.now(),
      clientName: form.clientName,
      email: form.email,
      phone: form.phone,
      eventName: form.eventName,
      eventType: form.eventType || 'Other',
      package: PACKAGES.find((p) => p.id === form.package)?.label ?? form.package,
      date: form.date || 'TBD',
      status: 'pending',
      selected: 0,
      total: uploadedFiles.length || (form.photoLimit ? parseInt(form.photoLimit) : 0),
      accessToken: token,
    };

    setGeneratedPass({ url, token, ...form, ...newUser });
    onUserAdded?.(newUser);
  };

  const handleReset = () => {
    setForm({ clientName: '', eventName: '', date: '', phone: '', email: '', eventType: '', package: '', photoLimit: '' });
    setUploadedFiles([]);
    setGeneratedPass(null);
    setStep(1);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">New Event</p>
        <h2 className="font-serif text-2xl text-white font-light">Create Client Event</h2>
        <p className="text-silver/40 text-sm mt-1">Fill in the details, upload photos, then share the access pass.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Client Details' },
          { n: 2, label: 'Upload Photos' },
          { n: 3, label: 'Access Pass' },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => !generatedPass && setStep(n)}
              className={`flex items-center gap-2 transition-colors ${step >= n ? 'text-gold' : 'text-silver/30'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step > n ? 'bg-gold text-black' : step === n ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-white/5 border border-white/10'}`}>
                {step > n ? '✓' : n}
              </div>
              <span className="text-sm hidden md:block">{label}</span>
            </button>
            {i < arr.length - 1 && <div className={`w-8 h-px ${step > n ? 'bg-gold/40' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!generatedPass ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Left column */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <p className="text-white/60 text-xs tracking-[0.2em] uppercase">Client Information</p>

              <InputField icon={User}     label="Client / Couple Name" placeholder="e.g. Sarah & James" value={form.clientName} onChange={set('clientName')} required />
              <InputField icon={Tag}      label="Event Name"            placeholder="e.g. The Henderson Wedding" value={form.eventName}  onChange={set('eventName')} required />
              <InputField icon={Phone}    label="Phone Number"          placeholder="+1 555-0000" value={form.phone} onChange={set('phone')} />
              <InputField icon={Calendar} label="Event Date"            type="date" value={form.date} onChange={set('date')} />

              {/* Event type */}
              <div>
                <label className="block text-silver/50 text-[10px] tracking-[0.2em] uppercase mb-2">Event Type</label>
                <div className="relative">
                  <select
                    value={form.eventType}
                    onChange={set('eventType')}
                    className="w-full appearance-none bg-charcoal/40 border border-white/8 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-gold/40 transition-all [color-scheme:dark] cursor-pointer"
                  >
                    <option value="">Select type…</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Package selector */}
              <div className="glass rounded-2xl p-6">
                <p className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Package Tier</p>
                <div className="space-y-3">
                  {PACKAGES.map((pkg) => (
                    <label key={pkg.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.id}
                        checked={form.package === pkg.id}
                        onChange={set('package')}
                        className="sr-only"
                      />
                      <div className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                        ${form.package === pkg.id
                          ? 'bg-gold/10 border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                          : `bg-charcoal/30 ${pkg.color}`}`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${form.package === pkg.id ? 'text-gold' : ''}`}>{pkg.label}</p>
                          <p className="text-silver/40 text-xs">{pkg.sub}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${form.package === pkg.id ? 'border-gold' : 'border-white/20'}`}>
                          {form.package === pkg.id && <div className="w-2 h-2 rounded-full bg-gold" />}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div className="glass rounded-2xl p-6">
                <p className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Upload Photos</p>
                <DragDropZone onFilesAdded={(files) => setUploadedFiles((p) => [...p, ...Array.from(files)])} />
              </div>
            </div>

            {/* Submit – full width */}
            <div className="lg:col-span-2 flex justify-end">
              <GoldButton
                type="submit"
                disabled={!form.clientName || !form.eventName || !form.package}
                className="px-12"
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Generate Access Pass
              </GoldButton>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="pass"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Success summary */}
            <div className="glass rounded-2xl p-6 space-y-4 border border-gold/10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs">Event Created Successfully</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Client', generatedPass.clientName],
                  ['Event', generatedPass.eventName],
                  ['Type', generatedPass.eventType],
                  ['Package', PACKAGES.find((p) => p.id === generatedPass.package)?.label],
                  ['Photos Uploaded', uploadedFiles.length || '0'],
                  ['Token', generatedPass.accessToken],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-silver/40">{k}</span>
                    <span className="text-white font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleReset} className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm hover:border-gold/30 hover:text-gold transition-all">
                + Create Another Event
              </button>
            </div>

            {/* Access pass card */}
            <AccessPassCard
              url={generatedPass.url}
              clientName={generatedPass.clientName}
              eventName={generatedPass.eventName}
              phone={generatedPass.phone}
              email={generatedPass.email}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
