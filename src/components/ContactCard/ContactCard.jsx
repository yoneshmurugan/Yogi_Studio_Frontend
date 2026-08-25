import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Video, Contact, ChevronRight, Camera } from 'lucide-react';
import { generateVCard } from './generateVCard';
import studioImg from '../../assets/Studio.webp';
import logoImg from '../../assets/yogi-logo-removebg-preview.png';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=H+96+Shop+no+4+Periyar+Nagar+Main+Road+80+feet+Corner+Erode+Tamil+Nadu+638001';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

// Custom brand icon component using SVG paths
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
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);

export default function ContactCard() {
  return (
    <div className="min-h-screen bg-obsidian flex items-start justify-center py-0 sm:py-10">
      <div className="w-full max-w-sm sm:max-w-md sm:rounded-3xl overflow-hidden shadow-2xl bg-charcoal relative">

        {/* ── Cover Banner ── */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={studioImg}
            alt="Yogi Digital Studio"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-charcoal" />
        </div>

        {/* ── Avatar ── */}
        <div className="flex justify-center -mt-14 relative z-10">
          <motion.div
            {...fadeUp(0.1)}
            className="w-28 h-28 rounded-full border-4 bg-smoke overflow-hidden shadow-xl"
            style={{ borderColor: '#D4AF37' }}
          >
            <img
              src={logoImg}
              alt="Yogi Studio Logo"
              className="w-full h-full object-contain p-1"
            />
          </motion.div>
        </div>

        {/* ── Name & Title ── */}
        <motion.div {...fadeUp(0.15)} className="text-center mt-3 px-6">
          <h1 className="text-2xl text-white font-serif tracking-wide">Yogibalu</h1>
          <p className="text-sm mt-1 font-semibold tracking-widest uppercase gold-text">
            Yogi Digital Studio
          </p>
          <p className="text-silver/60 text-xs mt-1 tracking-wider">Photographer · Videographer</p>
        </motion.div>

        {/* ── Quick Action Row ── */}
        <motion.div {...fadeUp(0.2)} className="flex justify-center gap-8 mt-6 px-6">
          {[
            { icon: Phone, label: 'Call', href: 'tel:+919842775676', color: '#4ade80' },
            { icon: Mail, label: 'Email', href: 'mailto:yogistudio2008@gmail.com', color: '#60a5fa' },
            { icon: MapPin, label: 'Map', href: MAPS_URL, color: '#f87171' },
          ].map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              target={label === 'Map' ? '_blank' : undefined}
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90"
                style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="text-silver/60 text-xs">{label}</span>
            </a>
          ))}
        </motion.div>

        {/* ── Save to Contacts CTA ── */}
        <motion.div {...fadeUp(0.25)} className="px-6 mt-6">
          <button
            onClick={generateVCard}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm tracking-wide text-black transition-transform duration-150 active:scale-97 gold-gradient shadow-lg"
          >
            <Contact size={18} />
            Save to Contacts
          </button>
        </motion.div>

        {/* ── Links Section ── */}
        <motion.div {...fadeUp(0.3)} className="px-6 mt-5 space-y-3">
          {[
            {
              IconComponent: () => <Globe size={18} style={{ color: '#D4AF37' }} />,
              label: 'Website',
              sub: 'yogidigitalstudio.in',
              href: 'https://yogidigitalstudio.in',
              color: '#D4AF37',
            },
            {
              IconComponent: () => <InstagramIcon size={18} color="#e1306c" />,
              label: 'Instagram',
              sub: '@yogistudio_official',
              href: 'https://www.instagram.com/yogistudio_official/',
              color: '#e1306c',
            },
            {
              IconComponent: () => <YoutubeIcon size={18} color="#ff0000" />,
              label: 'YouTube',
              sub: '@yogistudio-official',
              href: 'https://www.youtube.com/@yogistudio-official',
              color: '#ff4444',
            },
          ].map(({ IconComponent, label, sub, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-97 group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <IconComponent />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium">{label}</p>
                <p className="text-silver/50 text-xs truncate">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-silver/30 group-hover:text-silver/60 transition-colors" />
            </a>
          ))}
        </motion.div>

        {/* ── Address Footer ── */}
        <motion.div {...fadeUp(0.35)} className="px-6 mt-5 mb-10">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 px-4 py-4 rounded-2xl group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <MapPin size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-silver/50 text-xs leading-relaxed">
              H 96, Shop No 4, Periyar Nagar Main Road,<br />
              80 Feet Corner, Periyar Nagar Rd,<br />
              Erode, Tamil Nadu 638001
            </p>
          </a>
        </motion.div>

        {/* ── Branding Pill ── */}
        <div className="text-center pb-6">
          <p className="text-silver/25 text-[10px] tracking-widest uppercase">Yogi Digital Studio</p>
        </div>

      </div>
    </div>
  );
}
