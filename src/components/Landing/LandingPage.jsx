import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import ServicesSection from './ServicesSection';
import CinematicSequence from './CinematicSequence';
import TextMarquee from './TextMarquee';
import ParallaxImage from './ParallaxImage';
import FilterPills from './FilterPills';
import PortfolioGrid from './PortfolioGrid';
import AboutSection from './AboutSection';
import ContactFooter from './ContactFooter';
import ScrollReveal from '../ui/ScrollReveal';
import portfolioData, { categories } from '../../data/portfolioData';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const portfolioRef = useRef(null);

  const filteredPhotos = activeCategory === 'All'
    ? portfolioData
    : portfolioData.filter((p) => p.category === activeCategory);

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* 1. Cinematic Hero with Slow Pan & Glassmorphism */}
      <Hero onViewWork={scrollToPortfolio} />

      {/* 2. Services — Scroll-triggered reveal */}
      <ServicesSection />

      {/* 3. Sticky Cinematic Scroll Sequence (Replaces the first parallax break) */}
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

        <PortfolioGrid photos={filteredPhotos} />
      </section>

      {/* 5. Scroll-linked Text Marquee */}
      <TextMarquee />

      {/* Parallax Break Image */}
      <ParallaxImage
        src="https://picsum.photos/seed/parallax-couple/1920/800"
        alt="Couple portrait in golden light"
        speed={0.3}
        className="h-[50vh] md:h-[60vh]"
      />

      {/* 6. About — Parallax + Text reveals */}
      <AboutSection />

      {/* 7. Footer */}
      <ContactFooter />
    </div>
  );
}
