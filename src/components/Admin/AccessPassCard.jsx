import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCode } from 'react-qr-code';
import { Copy, Check, ExternalLink } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function AccessPassCard({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: already visible */
    }
  };

  if (!url) return null;

  return (
    <GlassCard hover={false} className="text-center">
      <p className="text-gold/80 text-xs tracking-[0.3em] uppercase mb-6">Access Pass</p>

      {/* QR Code Container */}
      <div className="inline-flex p-4 bg-white rounded-2xl mb-6">
        <QRCode
          value={url}
          size={160}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#0B0B0B"
        />
      </div>

      {/* URL Display + Copy */}
      <div className="flex items-center gap-2 bg-obsidian rounded-xl p-3 mb-4">
        <div className="flex-1 text-left truncate">
          <p className="text-[11px] text-silver/50 mb-0.5">Share this link</p>
          <p className="text-xs text-white/80 font-mono truncate">{url}</p>
        </div>

        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="w-4 h-4 text-gold" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy className="w-4 h-4 text-silver" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gold"
          >
            Copied to clipboard ✓
          </motion.p>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
