import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './SmoothScrollHero';
import ServicesSection from './ServicesSection';
import CinematicSequence from './CinematicSequence';
import TextMarquee from './TextMarquee';
import Infinitegrid from './InfiniteGrid';
import FilterPills from './FilterPills';
import PortfolioGrid from './PortfolioGrid';
import EAlbum from './EAlbum';
import AboutSection from './AboutSection';
import ContactFooter from './ContactFooter';
import ScrollReveal from '../ui/ScrollReveal';
import portfolioData, { categories } from '../../data/portfolioData';
import { BookOpen } from 'lucide-react';

import coverThumb from '../../assets/002.jpg';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [albumOpen, setAlbumOpen] = useState(false);
  const portfolioRef = useRef(null);

  const filteredPhotos = activeCategory === 'All'
    ? portfolioData
    : portfolioData.filter((p) => p.category === activeCategory);

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* 1. Cinematic Hero with Smooth Scrolling */}
      <Hero />

      {/* 2. Services — Scroll-triggered reveal */}
      <ServicesSection />

      {/* 3. Sticky Cinematic Scroll Sequence */}
      <CinematicSequence />

      {/* 4. Portfolio — Scroll-triggered reveal */}
      <section ref={portfolioRef} className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Portfolio</p>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
            Our Finest Work
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <FilterPills
            categories={categories}
            activeCategory={activeCategory}
            onFilter={setActiveCategory}
          />
        </ScrollReveal>

        {/* Show E-Album preview OR Portfolio Grid based on active category */}
        {activeCategory === 'E-Album' ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-silver/50 text-sm md:text-base max-w-xl text-center leading-relaxed">
              Experience our premium digital albums — flip through cinematic pages, enjoy background music, and immerse yourself in the story.
            </p>

            {/* Album preview card */}
            <motion.button
              onClick={() => setAlbumOpen(true)}
              className="group relative cursor-pointer border-none bg-transparent p-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="relative w-[320px] md:w-[480px] aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                <img
                  src={coverThumb}
                  alt="E-Album preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-70" />
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 2px rgba(212,175,55,.4), 0 0 40px rgba(212,175,55,.15)' }}
                />
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/40 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-500 group-hover:bg-[#d4af37]/20 group-hover:border-[#d4af37]/40 group-hover:scale-110">
                    <BookOpen className="w-7 h-7 text-white/80 group-hover:text-[#d4af37] transition-colors duration-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-serif text-white text-lg md:text-xl tracking-wide mb-1">Open Album</p>
                    <p className="text-white/40 text-xs tracking-widest uppercase">Click to explore</p>
                  </div>
                </div>
              </div>
              <div
                className="mt-4 mx-auto h-4 rounded-full opacity-40"
                style={{ width: '70%', background: 'radial-gradient(ellipse at center, rgba(212,175,55,.2) 0%, transparent 70%)' }}
              />
            </motion.button>
          </motion.div>
        ) : (
          <PortfolioGrid photos={filteredPhotos} />
        )}
      </section>

      {/* 5. Scroll-linked Text Marquee */}
      <TextMarquee />

      {/* Infinite Draggable Grid */}
      <div className="h-[70vh] w-full">
        <Infinitegrid />
      </div>

      {/* 6. About — Parallax + Text reveals */}
      <AboutSection />

      {/* 7. Footer */}
      <ContactFooter />

      {/* E-Album Fullscreen Overlay */}
      <AnimatePresence>
        {albumOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EAlbum onExit={() => setAlbumOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
