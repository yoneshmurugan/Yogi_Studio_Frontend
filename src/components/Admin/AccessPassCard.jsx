import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCode } from 'react-qr-code';
import { Copy, Check, MessageCircle, Mail, Share2 } from 'lucide-react';

export default function AccessPassCard({ url, clientName, eventName, phone, email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${clientName || 'there'}! 🎉\n\nYour photos from *${eventName || 'your event'}* are ready to view.\n\nClick the link below to browse and select your favourites:\n${url}\n\n— Yogi Studio`
    );
    const waUrl = phone
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Your Photos Are Ready — ${eventName || 'Yogi Studio'}`);
    const body = encodeURIComponent(
      `Hi ${clientName || 'there'},\n\nYour photos are ready to view! Please visit the link below to browse and select your favourites:\n\n${url}\n\nWarm regards,\nYogi Studio`
    );
    const mailTo = email ? `mailto:${email}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`;
    window.open(mailTo);
  };

  if (!url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="flex items-center gap-2 justify-center mb-1">
        <Share2 className="w-3.5 h-3.5 text-gold/70" />
        <p className="text-gold/80 text-[10px] tracking-[0.3em] uppercase">Access Pass Generated</p>
      </div>

      {/* Client info */}
      {clientName && (
        <div className="mb-5">
          <p className="text-white font-medium text-base">{clientName}</p>
          <p className="text-silver/50 text-sm">{eventName}</p>
        </div>
      )}

      {/* QR Code */}
      <div className="inline-flex p-3.5 bg-white rounded-2xl mb-5 shadow-lg">
        <QRCode value={url} size={140} level="H" bgColor="#FFFFFF" fgColor="#0B0B0B" />
      </div>

      {/* URL + copy */}
      <div className="flex items-center gap-2 bg-[#0B0B0B] rounded-xl p-3 mb-4 border border-white/[0.06]">
        <div className="flex-1 text-left truncate">
          <p className="text-[10px] text-silver/40 mb-0.5">Client gallery link</p>
          <p className="text-xs text-white/70 font-mono truncate">{url}</p>
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
                <Copy className="w-4 h-4 text-silver/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={handleWhatsApp}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium transition-all hover:bg-[#25D366]/15"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </motion.button>
        <motion.button
          onClick={handleEmail}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium transition-all hover:bg-blue-500/15"
        >
          <Mail className="w-4 h-4" />
          Email
        </motion.button>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gold mt-3"
          >
            Link copied to clipboard ✓
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
