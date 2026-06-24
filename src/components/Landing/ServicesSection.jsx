import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

import img1 from '../../assets/AG_00223.webp';
import img2 from '../../assets/C_0528.webp';
import img3 from '../../assets/AG_00153.webp';
import img4 from '../../assets/C-1670copy.webp';
import img5 from '../../assets/14.webp';
import img6 from '../../assets/yonesh-48.webp';

const services = [
  {
    title: 'Cinematic Wedding Films',
    description: 'Beautifully crafted wedding highlights — film-grade storytelling that feels like a feature.',
    image: img1,
  },
  {
    title: 'Candid Photography',
    description: 'Capturing raw emotions & real moments with an editorial, unposed eye.',
    image: img2,
  },
  {
    title: 'Coming of Age Ceremonies',
    description: 'Beautifully documenting cultural milestones like Half-Saree functions with warmth, elegance, and tradition.',
    image: img3,
  },
  {
    title: 'Traditional Photography & Videography',
    description: 'Classic elegance — time-honoured rituals documented with grace and precision.',
    image: img4,
  },
  {
    title: 'Pre & Post-Wedding Shoots',
    description: 'Romantic & artistic storytelling before and after the big day.',
    image: img5,
  },
  {
    title: 'Baby & Family Portraits',
    description: 'Treasured milestones — newborns, maternity, couples, and family gatherings.',
    image: img6,
  },
];

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = '0.3s';

function ServiceCard({ service, index, isMobile }) {
  const [hovered, setHovered] = useState(false);
  // On mobile, always show content (no hover available)
  const isActive = isMobile || hovered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay: (index % (isMobile ? 1 : 3)) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        aspectRatio: isMobile ? '3 / 4' : '4.5 / 5',
        cursor: 'pointer',
      }}
    >
      {/* ── Image Layer ── */}
      {/* On mobile: single layer (no grayscale trick) for GPU savings */}
      {isMobile ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${service.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.55)',
            willChange: 'transform',
          }}
        />
      ) : (
        <>
          {/* Grayscale Base Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${service.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(100%) brightness(0.45)',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: `transform ${DURATION} ${EASING}`,
              willChange: 'transform',
            }}
          />
          {/* Color Overlay Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${service.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.72)',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: `opacity ${DURATION} ${EASING}, transform ${DURATION} ${EASING}`,
              willChange: 'opacity, transform',
            }}
          />
        </>
      )}

      {/* ── Bottom dark gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isActive
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.20) 55%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
          transition: isMobile ? 'none' : `background ${DURATION} ${EASING}`,
        }}
      />

      {/* ── Gold top shimmer line ── */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: `transform 0.65s ${EASING}`,
          }}
        />
      )}

      {/* ── Text content ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isMobile ? '1.25rem' : '2rem',
          transform: isMobile ? 'none' : (hovered ? 'translateY(0)' : 'translateY(40px)'),
          transition: isMobile ? 'none' : `transform ${DURATION} ${EASING}`,
          willChange: isMobile ? 'auto' : 'transform',
        }}
      >
        {/* Gold accent rule */}
        <div
          style={{
            height: '2px',
            width: isActive ? '64px' : '32px',
            background: '#d4af37',
            marginBottom: isMobile ? '0.75rem' : '1rem',
            opacity: 0.8,
            transition: `width ${DURATION} ${EASING}`,
          }}
        />

        {/* Title */}
        <h3
          style={{
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            fontSize: isMobile ? '1.15rem' : '1.4rem',
            fontWeight: 400,
            lineHeight: 1.35,
            marginBottom: isMobile ? '0.5rem' : '1rem',
            letterSpacing: '0.015em',
          }}
        >
          {service.title}
        </h3>

        {/* Description — always visible on mobile */}
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: isMobile ? '0.85rem' : '1rem',
            lineHeight: 1.6,
            opacity: isActive ? 1 : 0,
            transition: isMobile ? 'none' : `opacity 0.25s ${EASING}`,
            willChange: isMobile ? 'auto' : 'opacity',
          }}
        >
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section className="px-4 md:px-12 lg:px-20 py-16 md:py-32 max-w-screen-2xl mx-auto">
      <ScrollReveal className="text-center mb-10 md:mb-16">
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Our Services</p>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-white mb-4 md:mb-6">
          What We Create
        </h2>
        <p className="text-silver/60 text-base md:text-xl font-light max-w-2xl mx-auto">
          We craft timeless memories, transforming your most precious moments into cinematic and artistic visual stories.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {services.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}
