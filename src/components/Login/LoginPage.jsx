import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import GoldButton from '../ui/GoldButton';
import yogiLogo from '../../assets/yogi-logo.jpg';

const DEMO_CREDENTIALS = {
  'admin@yogi.studio': { password: 'admin', role: 'admin' },
  'customer@yogi.studio': { password: 'customer', role: 'customer' },
};

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const user = DEMO_CREDENTIALS[email.toLowerCase()];
    if (user && user.password === password) {
      onLoginSuccess(user.role);
    } else {
      setError('Invalid credentials. Try admin@yogi.studio / admin');
      setIsLoading(false);
    }
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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img
              src={yogiLogo}
              alt="Yogi Digital Studio"
              className="w-32 mx-auto mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            />
            <h1 className="font-serif text-2xl text-white mb-1">Welcome Back</h1>
            <p className="text-silver/40 text-sm">Sign in to your studio portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-silver/40 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yogi.studio"
                required
                className="w-full bg-obsidian border border-white/8 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-silver/20 focus:outline-none focus:border-gold/40 transition-colors"
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
                  className="flex items-center gap-2 text-red-400/80 text-xs bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-2.5"
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
                  Sign In
                </>
              )}
            </GoldButton>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-silver/25 mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              <p className="text-xs text-silver/30">
                Admin: <span className="text-gold/50 font-mono">admin@yogi.studio</span> / <span className="text-gold/50 font-mono">admin</span>
              </p>
              <p className="text-xs text-silver/30">
                Customer: <span className="text-gold/50 font-mono">customer@yogi.studio</span> / <span className="text-gold/50 font-mono">customer</span>
              </p>
            </div>
          </div>

          {/* Back link */}
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-2 text-center text-xs text-silver/30 hover:text-silver/60 transition-colors cursor-pointer"
          >
            ← Back to Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
