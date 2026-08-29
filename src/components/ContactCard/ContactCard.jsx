import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, ChevronRight, Contact, Share2, Check, MessageSquare } from 'lucide-react';
import { AppStoreButton, GooglePlayButton } from '../base/buttons/app-store-buttons';

import { generateVCard } from './generateVCard';
import studioImg from '../../assets/Studio.webp';
import logoImg from '../../assets/yogi-logo-removebg-preview.png';
import appstoreImg from '../../assets/appstore.png';
import './ContactCard.css';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=H+96+Shop+no+4+Periyar+Nagar+Main+Road+80+feet+Corner+Erode+Tamil+Nadu+638001';

// Custom SVG brand icons
const InstagramIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
  </svg>
);



const YoutubeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111"/>
  </svg>
);

// Floating gold particles background
function GoldParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -(Math.random() * 0.4 + 0.1),
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.pulse += 0.02;
        const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${o})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${o * 0.15})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="cc-particles" />;
}

export default function ContactCard() {
  const [saved, setSaved] = useState(false);

  // Auto-trigger save on page load
  useEffect(() => {
    const timer = setTimeout(() => { generateVCard(); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 5000);
    return () => clearTimeout(timer);
  }, []);
  const [shared, setShared] = useState(false);

  const handleSave = () => {
    generateVCard();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Yogi Digital Studio',
          text: 'Check out Yogi Digital Studio — Professional Photography & Videography',
          url: 'https://yogidigitalstudio.in/contact-card',
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText('https://yogidigitalstudio.in/contact-card');
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const actions = [
    { icon: Phone, label: 'Call', href: 'tel:+919842775676', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    { icon: Mail, label: 'Email', href: 'mailto:yogistudio2004@gmail.com', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { icon: MapPin, label: 'Directions', href: MAPS_URL, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    { icon: MessageSquare, label: 'Feedback', href: 'mailto:yogistudio2004@gmail.com?subject=Feedback', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  ];

  const links = [
    {
      Icon: () => <img src={appstoreImg} alt="Yogi" className="w-5 h-5 object-contain rounded-sm" />,
      label: 'Website',
      sub: 'yogidigitalstudio.in',
      href: 'https://yogidigitalstudio.in',
      gradient: 'rgba(255,255,255,0.06)',
    },
    {
      Icon: () => <InstagramIcon size={18} color="#fff" />,
      label: 'Instagram',
      sub: '@yogistudio_official',
      href: 'https://www.instagram.com/yogistudio_official/',
      gradient: 'linear-gradient(135deg, #f77737, #fd1d1d, #c13584)',
    },
    {
      Icon: () => <YoutubeIcon size={18} color="#fff" />,
      label: 'YouTube',
      sub: '@yogistudio-official',
      href: 'https://www.youtube.com/@yogistudio-official',
      gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
    },
  ];

  return (
    <div className="cc-page">
      

      <motion.div
        className="cc-card"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Cover ── */}
        <div className="cc-cover">
          <img src={studioImg} alt="Yogi Digital Studio" className="cc-cover-img" />
          <div className="cc-cover-overlay" />
          <div className="cc-cover-shimmer" />
        </div>

        {/* ── Avatar ── */}
        <div className="cc-avatar-wrap">
          <motion.div
            className="cc-avatar-ring"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 120 }}
          >
            <div className="cc-avatar-inner">
              <img src={logoImg} alt="Yogi Studio Logo" className="cc-avatar-img" />
            </div>
          </motion.div>
        </div>

        {/* ── Identity ── */}
        <motion.div
          className="cc-identity"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h1 className="cc-name">Yogibalu</h1>
          <p className="cc-title">Yogi Digital Studio</p>
          <div className="cc-role-pill">
            <span className="cc-role-dot" />
            Photographer · Videographer
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          className="cc-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          {actions.map(({ icon: Icon, label, href, gradient }, i) => (
            <motion.a
              key={label}
              href={href}
              target={label === 'Directions' ? '_blank' : undefined}
              rel="noreferrer"
              className="cc-action-btn"
              whileTap={{ scale: 0.88 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <div className="cc-action-circle" style={{ background: gradient }}>
                <Icon size={20} color="#fff" />
              </div>
              <span className="cc-action-label">{label}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="cc-cta-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button onClick={handleSave} className="cc-save-btn">
            <div className="cc-save-shine" />
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="cc-save-inner">
                  <Check size={18} /> Saved!
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="cc-save-inner">
                  <Contact size={18} /> Save to Contacts
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button onClick={handleShare} className="cc-share-btn">
            <AnimatePresence mode="wait">
              {shared ? (
                <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={16} />
                </motion.span>
              ) : (
                <motion.span key="share" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Share2 size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* ── Links ── */}
        <motion.div
          className="cc-links"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {links.map(({ Icon, label, sub, href, gradient }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="cc-link-card"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + i * 0.1, duration: 0.4 }}
            >
              <div className="cc-link-icon" style={{ background: gradient }}>
                <Icon />
              </div>
              <div className="cc-link-text">
                <p className="cc-link-label">{label}</p>
                <p className="cc-link-sub">{sub}</p>
              </div>
              <ChevronRight size={15} className="cc-link-arrow" />
            </motion.a>
          ))}
        </motion.div>

        
        {/* ── Mobile Apps ── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-5 pb-6 pt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <GooglePlayButton size="md" className="w-full sm:w-auto" href="https://play.google.com/store/apps/details?id=com.yogistudio.app&pcampaignid=web_share" />
          <AppStoreButton size="md" className="w-full sm:w-auto" href="https://apps.apple.com/in/app/yogi-digital-studio/id6790760209" />
        </motion.div>

        {/* ── Address ── */}
        <motion.a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="cc-address"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="cc-address-pin">
            <MapPin size={14} color="#ef4444" />
          </div>
          <p>
            H 96, Shop No 4, Periyar Nagar Main Road,<br />
            80 Feet Corner, Erode, Tamil Nadu 638001
          </p>
        </motion.a>

        {/* ── Bottom Branding ── */}
        <motion.div
          className="cc-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <div className="cc-footer-line" />
          <p>Yogi Digital Studio</p>
          <div className="cc-footer-line" />
        </motion.div>
      </motion.div>
    </div>
  );
}
