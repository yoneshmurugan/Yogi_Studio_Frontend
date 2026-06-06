import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedText from '../ui/AnimatedText';
import GoldButton from '../ui/GoldButton';
import yogiLogo from '../../assets/yogi-logo.jpg';

export default function Hero({ onViewWork }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Scroll-linked scrubbing: hero fades + zooms as user scrolls
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.8, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '120px']);

  return (
    <section ref={heroRef} className="relative h-[120vh] overflow-hidden bg-black">
      {/* Infinite Slow Pan Background */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: bgY, scale: heroScale }}
      >
        <motion.img
          src="https://picsum.photos/seed/luxury-wedding-hero/1920/1080"
          alt="Cinematic wedding shot"
          className="w-full h-full object-cover origin-center"
          animate={{ scale: [1.05, 1.15, 1.05] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Cinematic Overlays */}
      {/* 1. Heavy dark gradient to focus center */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/90 pointer-events-none" />
      
      {/* 2. Film Grain Effect (CSS patterned noise) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
      }} />

      {/* 3. Golden Light Leak */}
      <motion.div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gold/15 rounded-full blur-[120px] pointer-events-none"
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-40 -right-40 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px] pointer-events-none"
        animate={{ 
          x: [0, -100, 0],
          y: [0, -50, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content — scrub-linked fade out */}
      <motion.div
        className="relative z-10 h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: heroOpacity, y: contentY }}
      >
        {/* Logo wrapped in a subtle glass effect to make it pop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 p-6 glass rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
        >
          <img
            src={yogiLogo}
            alt="Yogi Digital Studio"
            className="w-48 md:w-64 lg:w-80 mx-auto"
          />
        </motion.div>

        {/* Tagline — letter by letter */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6 max-w-5xl drop-shadow-2xl">
          <AnimatedText text="Where Art Meets" delay={0.8} />
          <br />
          <AnimatedText text="Emotion" delay={1.4} className="italic gold-text drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
        </h1>

        <motion.p
          className="text-silver text-sm md:text-base max-w-lg mx-auto mb-12 leading-relaxed tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          The opulent digital studio — capturing future memories through high-fashion wedding photography & cinematic videography.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
        >
          <GoldButton onClick={onViewWork} className="!px-10 !py-4 text-sm">
            Enter the Gallery
          </GoldButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
      >
        <span className="text-white/60 text-[9px] tracking-[0.4em] uppercase font-bold">Scroll to Explore</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent"
          animate={{ scaleY: [1, 0.3, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
