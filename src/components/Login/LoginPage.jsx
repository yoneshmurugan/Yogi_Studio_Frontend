import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import GoldButton from '../ui/GoldButton';
import yogiLogo from '../../assets/yogi-logo-removebg-preview.png';

const ADMIN_DEMO = {
  email: 'admin@gmail',
  password: '123456',
};

export default function LoginPage({ onLoginSuccess, onBack }) {
  // 'client' | 'admin'
  const [loginMode, setLoginMode] = useState('client');
  
  // Client States
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  // Admin States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Shared
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef(null);

  // Clear stale reCAPTCHA instances (important for React Hot Reload)
  useEffect(() => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) {}
      window.recaptchaVerifier = null;
    }
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otpSent) {
      if (phone.length < 8) {
        setError('Please enter a valid phone number');
        setIsLoading(false);
        return;
      }
      
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

      try {
        // Pre-check phone number
        const checkRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customer/auth/check-phone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formattedPhone })
        });
        
        if (!checkRes.ok) {
          setError('Phone number not registered. Please contact the studio.');
          setIsLoading(false);
          return;
        }

        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setIsLoading(false);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } catch (err) {
        console.error("Login Flow Error:", err);
        setError("Failed to process request. Check terminal console logs.");
        setIsLoading(false);
      }
    } else {
      // Verify OTP
      if (otpCode.length < 4) {
        setError('Please enter the OTP sent to your phone');
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await confirmationResult.confirm(otpCode);
        const user = result.user;
        
        // AWS Backend Handshake
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customer/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phoneNumber })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('studio_session_token', data.token);
          setIsLoading(false);
          onLoginSuccess('customer');
        } else {
          setError(`Server Error: ${data.error}`);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("OTP Verification Error:", err);
        setError("Invalid verification code typed. Try again.");
        setIsLoading(false);
      }
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800)); // Simulate API

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || ADMIN_DEMO.email;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || ADMIN_DEMO.password;

    if (email.toLowerCase() === adminEmail && password === adminPassword) {
      sessionStorage.setItem('adminAuth', 'true');
      onLoginSuccess('admin');
    } else {
      setError('Invalid admin credentials.');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setOtpSent(false);
    setOtpCode('');
    setPhone('');
    setEmail('');
    setPassword('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-6 py-20 relative"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/login-bg/1920/1080"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
      </div>

      <div id="recaptcha-container"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/[0.05]">
          
          {/* Top Toggles */}
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5 mb-8 relative">
            <div 
              className="absolute inset-y-1 w-[calc(50%-8px)] bg-gold/10 border border-gold/20 rounded-lg transition-all duration-300 ease-out"
              style={{ left: loginMode === 'client' ? '4px' : 'calc(50% + 4px)' }}
            />
            <button
              onClick={() => { setLoginMode('client'); resetForm(); }}
              className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider relative z-10 transition-colors
                ${loginMode === 'client' ? 'text-gold' : 'text-silver/40 hover:text-white'}`}
            >
              Client Login
            </button>
            <button
              onClick={() => { setLoginMode('admin'); resetForm(); }}
              className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider relative z-10 transition-colors
                ${loginMode === 'admin' ? 'text-gold' : 'text-silver/40 hover:text-white'}`}
            >
              Admin Login
            </button>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img
              src={yogiLogo}
              alt="Yogi Digital Studio"
              className="w-24 md:w-32 mx-auto mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            />
            <h1 className="font-serif text-2xl text-white mb-1">
              {loginMode === 'client' ? 'Client Portal' : 'Admin Portal'}
            </h1>
            <p className="text-silver/40 text-sm">
              {loginMode === 'client' ? 'Sign in with your phone number' : 'Sign in to manage studio operations'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── CLIENT LOGIN FORM ── */}
            {loginMode === 'client' && (
              <motion.form
                key="client-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleClientSubmit}
                className="space-y-5"
              >
                {!otpSent ? (
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-silver/40 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-silver/40">
                        <Phone className="w-4 h-4" />
                        <span className="text-white/80 font-medium text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-obsidian border border-white/8 rounded-xl py-3.5 pl-[4.5rem] pr-4 text-sm text-white focus:outline-none focus:border-gold/40 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-silver/40">
                        Enter OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                        className="text-[10px] text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <ArrowLeft className="w-3 h-3" /> Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/40">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        ref={otpInputRef}
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit code"
                        maxLength={6}
                        required
                        className="w-full bg-obsidian border border-white/8 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-silver/20 focus:outline-none focus:border-gold/40 transition-colors tracking-widest"
                      />
                    </div>
                    <p className="text-xs text-silver/40 mt-3 text-center">
                      We've sent a code to <span className="text-white font-medium">{phone}</span>
                    </p>
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="flex items-center gap-2 text-red-400/80 text-xs bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-2.5 overflow-hidden"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <GoldButton
                  type="submit"
                  disabled={isLoading || (!otpSent && !phone) || (otpSent && !otpCode)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {otpSent ? 'Verify & Sign In' : 'Send OTP'}
                    </>
                  )}
                </GoldButton>
              </motion.form>
            )}

            {/* ── ADMIN LOGIN FORM ── */}
            {loginMode === 'admin' && (
              <motion.form
                key="admin-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAdminSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-silver/40 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-obsidian border border-white/8 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-silver/40 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-obsidian border border-white/8 rounded-xl py-3.5 px-4 pr-11 text-sm text-white placeholder:text-silver/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-silver/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="flex items-center gap-2 text-red-400/80 text-xs bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-2.5 overflow-hidden"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <GoldButton
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Access Admin Panel
                    </>
                  )}
                </GoldButton>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back link */}
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 pt-6 border-t border-white/5 text-center text-xs text-silver/30 hover:text-silver/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Website
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
