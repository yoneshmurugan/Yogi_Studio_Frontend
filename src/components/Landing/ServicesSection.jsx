import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const services = [
  {
    title: 'Cinematic Wedding Films',
    description: 'Beautifully crafted wedding highlights — film-grade storytelling that feels like a feature.',
    image: 'src/assets/IMG_9561.JPG',
  },
  {
    title: 'Candid Photography',
    description: 'Capturing raw emotions & real moments with an editorial, unposed eye.',
    image: 'src/assets/0G1A7726.jpg',
  },
  {
    title: 'Coming of Age Ceremonies',
    description: 'Beautifully documenting cultural milestones like Half-Saree functions with warmth, elegance, and tradition.',
    image: 'src/assets/01.jpg',
  },
  {
    title: 'Traditional Photography & Videography',
    description: 'Classic elegance — time-honoured rituals documented with grace and precision.',
    image: 'src/assets/IMG_9561.JPG',
  },
  {
    title: 'Pre & Post-Wedding Shoots',
    description: 'Romantic & artistic storytelling before and after the big day.',
    image: 'src/assets/IMG-20240503-WA0022.jpg',
  },
  {
    title: 'Baby & Family Portraits',
    description: 'Treasured milestones — newborns, maternity, couples, and family gatherings.',
    image: 'src/assets/IMG-20240423-WA0055.jpg',
  },
];

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION = '0.75s';

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        aspectRatio: '4 / 5',
        cursor: 'pointer',
      }}
    >
      {/* ── Photo layer — grayscale ↔ color ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${service.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: hovered
            ? 'grayscale(0%) brightness(0.72)'
            : 'grayscale(100%) brightness(0.5)',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: `filter ${DURATION} ${EASING}, transform ${DURATION} ${EASING}`,
          willChange: 'filter, transform',
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
          height: '2px',
          background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: `transform 0.65s ${EASING}`,
        }}
      />

      {/* ── Text content ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.75rem',
        }}
      >
        {/* Gold accent rule */}
        <div
          style={{
            height: '1.5px',
            width: hovered ? '52px' : '28px',
            background: '#d4af37',
            marginBottom: '0.7rem',
            opacity: 0.8,
            transition: `width ${DURATION} ${EASING}`,
          }}
        />

        {/* Title */}
        <h3
          style={{
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            fontSize: '1.05rem',
            fontWeight: 400,
            lineHeight: 1.35,
            marginBottom: '0.55rem',
            letterSpacing: '0.015em',
          }}
        >
          {service.title}
        </h3>

        {/* Description — fades + slides in on hover */}
        <p
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            maxHeight: hovered ? '80px' : '0px',
            opacity: hovered ? 1 : 0,
            overflow: 'hidden',
            transition: `opacity 0.55s ${EASING}, max-height 0.65s ${EASING}`,
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
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Our Services</p>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
          What We Create
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
