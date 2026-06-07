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
function Field({ label, icon: Icon, ...rest }) {
  return (
    <div>
      <label className="block text-silver/50 text-[10px] tracking-[0.2em] uppercase mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input
          {...rest}
          className="w-full bg-charcoal/40 border border-white/8 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-silver/25
            focus:outline-none focus:border-gold/40 transition-all [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

export default function AddUserSection({ onUserAdded }) {
  const [step, setStep]           = useState('details'); // 'details' | 'otp' | 'success'
  const [form, setForm]           = useState({ name: '', phone: '' });
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [sending, setSending]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [created, setCreated]     = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const steps = ['details', 'otp', 'success'];
  const stepIdx = steps.indexOf(step);
  const dotStatus = (i) =>
    stepIdx > i ? 'done' : stepIdx === i ? 'active' : 'idle';

  // ── Send OTP (mocked) ────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setStep('otp');
  };

  // ── Verify OTP (mocked — any 6-digit code passes) ───────────────────────
  const handleVerify = async () => {
    if (otp.join('').length < 6) return;
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    const user = {
      id: Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'active',
    };
    setCreated(user);
    onUserAdded(user);
    setVerifying(false);
    setStep('success');
  };

  // ── OTP box handlers ─────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const reset = () => {
    setStep('details');
    setForm({ name: '', phone: '' });
    setOtp(['', '', '', '', '', '']);
    setCreated(null);
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
          { n: 2, label: 'Verify OTP' },
          { n: 3, label: 'Done' },
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
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+91 98765 43210"
            />
            <div className="pt-1">
              <GoldButton
                onClick={handleSendOtp}
                disabled={sending || !form.name.trim() || !form.phone.trim()}
                className="w-full flex items-center justify-center gap-2"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><ShieldCheck className="w-4 h-4" /> Send OTP</>}
              </GoldButton>
            </div>
          </motion.div>
        )}

        {/* ── OTP ── */}
        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 space-y-6"
          >
            {/* Icon */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <p className="text-white font-medium mb-1">OTP Sent</p>
              <p className="text-silver/50 text-sm">
                Enter the 6-digit code sent to{' '}
                <span className="text-white/70">{form.phone}</span>
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  className="w-11 text-center text-xl font-bold bg-charcoal/40 border border-white/10 rounded-xl text-white
                    focus:outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
                  style={{ height: 52 }}
                />
              ))}
            </div>

            <GoldButton
              onClick={handleVerify}
              disabled={verifying || otp.join('').length < 6}
              className="w-full flex items-center justify-center gap-2"
            >
              {verifying
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'Verify & Create User'}
            </GoldButton>

            <button
              onClick={() => setStep('details')}
              className="w-full text-center text-xs text-silver/30 hover:text-silver/60 transition-colors"
            >
              ← Change phone number
            </button>
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
