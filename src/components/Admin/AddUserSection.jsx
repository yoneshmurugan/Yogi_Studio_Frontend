import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, ShieldCheck, Loader2, CheckCircle,
} from 'lucide-react';
import GoldButton from '../ui/GoldButton';

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDot({ n, status }) {
  // status: 'done' | 'active' | 'idle'
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
        ${status === 'done'   ? 'bg-gold text-black'
        : status === 'active' ? 'bg-gold/20 text-gold border border-gold/40'
        :                       'bg-white/5 border border-white/10 text-silver/30'}`}
    >
      {status === 'done' ? '✓' : n}
    </div>
  );
}

// ── Labelled input ─────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, prefix, ...rest }) {
  return (
    <div>
      <label className="block text-silver/50 text-[10px] tracking-[0.2em] uppercase mb-1.5">{label}</label>
      <div className="relative">
        {prefix ? (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-silver/30">
            <Icon className="w-4 h-4" />
            <span className="text-white/80 font-medium text-sm">{prefix}</span>
          </div>
        ) : (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        )}
        <input
          {...rest}
          className={`w-full bg-charcoal/40 border border-white/8 rounded-xl py-3 pr-4 text-sm text-white placeholder:text-silver/25
            focus:outline-none focus:border-gold/40 transition-all [color-scheme:dark] ${prefix ? 'pl-[4.5rem]' : 'pl-10'}`}
        />
      </div>
    </div>
  );
}

export default function AddUserSection({ onUserAdded }) {
  const [step, setStep]           = useState('details'); // 'details' | 'success'
  const [form, setForm]           = useState({ name: '', phone: '' });
  const [creating, setCreating]   = useState(false);
  const [created, setCreated]     = useState(null);
  const [error, setError]         = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const steps = ['details', 'success'];
  const stepIdx = steps.indexOf(step);
  const dotStatus = (i) =>
    stepIdx > i ? 'done' : stepIdx === i ? 'active' : 'idle';

  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setCreating(true);
    setError('');

    try {
      const finalPhone = form.phone.startsWith('+') ? form.phone.trim() : `+91${form.phone.trim()}`;
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), phone: finalPhone })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user');
      
      setCreated(data.user);
      onUserAdded(data.user);
      setStep('success');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setStep('details');
    setForm({ name: '', phone: '' });
    setCreated(null);
    setError('');
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold/70 text-[10px] tracking-[0.35em] uppercase mb-1">Onboarding</p>
        <h2 className="font-serif text-2xl text-white font-light">Add New User</h2>
        <p className="text-silver/40 text-sm mt-1">
          Create a client account with their name and phone number.
        </p>
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Details' },
          { n: 2, label: 'Done' },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <StepDot n={n} status={dotStatus(i)} />
              <span
                className={`text-sm hidden md:block transition-colors ${
                  dotStatus(i) === 'active' ? 'text-white'
                  : dotStatus(i) === 'done'  ? 'text-gold/70'
                  : 'text-silver/30'
                }`}
              >
                {label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className={`w-8 h-px transition-colors ${stepIdx > i ? 'bg-gold/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step panels */}
      <AnimatePresence mode="wait">

        {/* ── Details ── */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 space-y-5"
          >
            <Field
              label="Client Name"
              icon={User}
              value={form.name}
              onChange={set('name')}
              placeholder="Full name or couple's name"
              autoFocus
            />
            <Field
              label="Phone Number"
              icon={Phone}
              prefix="+91"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="98765 43210"
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <div className="pt-1">
              <GoldButton
                onClick={handleCreateUser}
                disabled={creating || !form.name.trim() || !form.phone.trim()}
                className="w-full flex items-center justify-center gap-2"
              >
                {creating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><ShieldCheck className="w-4 h-4" /> Create User</>}
              </GoldButton>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === 'success' && created && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-8 text-center space-y-5 border border-emerald-500/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </motion.div>

            <div>
              <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase mb-2">User Created</p>
              <p className="text-white font-serif text-2xl font-light">{created.name}</p>
              <p className="text-silver/50 text-sm mt-1">{created.phone}</p>
            </div>

            <p className="text-silver/30 text-xs">
              You've been redirected to the Users tab. Create events for this user there.
            </p>

            <button
              onClick={reset}
              className="w-full py-2.5 rounded-xl border border-white/10 text-silver/60 text-sm
                hover:border-gold/30 hover:text-gold transition-all"
            >
              + Add Another User
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
