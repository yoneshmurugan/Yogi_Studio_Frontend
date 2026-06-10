import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

import img1 from '../../assets/AG_00223.JPG';
import img2 from '../../assets/C_0528.jpg';
import img3 from '../../assets/AG_00153.JPG';
import img4 from '../../assets/C-1670copy.jpg';
import img5 from '../../assets/14.jpg';
import img6 from '../../assets/yonesh-48.JPG';

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

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        aspectRatio: '4.5 / 5',
        cursor: 'pointer',
      }}
    >
      {/* ── Grayscale Base Layer (Static Filter) ── */}
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

      {/* ── Color Overlay Layer (Fades in via Opacity) ── */}
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

      {/* ── Bottom dark gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
          transition: `background ${DURATION} ${EASING}`,
        }}
      />

      {/* ── Gold top shimmer line ── */}
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

      {/* ── Text content (Reflow-free Animation) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '2rem',
          transform: hovered ? 'translateY(0)' : 'translateY(40px)',
          transition: `transform ${DURATION} ${EASING}`,
          willChange: 'transform',
        }}
      >
        {/* Gold accent rule */}
        <div
          style={{
            height: '2px',
            width: hovered ? '64px' : '32px',
            background: '#d4af37',
            marginBottom: '1rem',
            opacity: 0.8,
            transition: `width ${DURATION} ${EASING}`,
          }}
        />

        {/* Title */}
        <h3
          style={{
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            fontSize: '1.4rem',
            fontWeight: 400,
            lineHeight: 1.35,
            marginBottom: '1rem',
            letterSpacing: '0.015em',
          }}
        >
          {service.title}
        </h3>

        {/* Description — GPU optimized slide & fade */}
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1rem',
            lineHeight: 1.6,
            opacity: hovered ? 1 : 0,
            transition: `opacity 0.25s ${EASING}`,
            willChange: 'opacity',
          }}
        >
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-screen-2xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Our Services</p>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-white mb-6">
          What We Create
        </h2>
        <p className="text-silver/60 text-lg md:text-xl font-light max-w-2xl mx-auto">
          We craft timeless memories, transforming your most precious moments into cinematic and artistic visual stories.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {services.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
