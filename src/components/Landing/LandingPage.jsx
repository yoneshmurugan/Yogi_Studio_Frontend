import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Hero from './SmoothScrollHero';
import ServicesSection from './ServicesSection';
import CinematicSequence from './CinematicSequence';
import TextMarquee from './TextMarquee';
import Infinitegrid from './InfiniteGrid';
import FilterPills from './FilterPills';
import PortfolioGrid from './PortfolioGrid';
import EAlbum from './EAlbum';
import VideoModal from './VideoModal';
import PublicPhotoLightbox from './PublicPhotoLightbox';
import AboutSection from './AboutSection';
import ContactFooter from './ContactFooter';
import ScrollReveal from '../ui/ScrollReveal';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [albumOpen, setAlbumOpen] = useState(false);
  const [activeAlbumPhotos, setActiveAlbumPhotos] = useState([]);
  const [activeAlbumMusic, setActiveAlbumMusic] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  
  // Public Photo Lightbox state
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
  const [photoLightboxIndex, setPhotoLightboxIndex] = useState(0);

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [randomizedAllItems, setRandomizedAllItems] = useState([]);
  const portfolioRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 300);
    }
  }, [location.hash]);

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio', 'items'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/portfolio`);
      const data = await res.json();
      return data.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache specifically for landing page
  });

  useEffect(() => {
    if (portfolioData) {
      setPortfolioItems(portfolioData);
      setRandomizedAllItems(prev => {
        if (prev.length > 0) return prev; // Prevent reshuffling on background refetch
        const shuffled = [...portfolioData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 15);
      });
    }
  }, [portfolioData]);

  // Dynamically extract unique event names from portfolio items
  const categories = useMemo(() => {
    const eventNames = new Set(portfolioItems.map(p => p.eventName).filter(Boolean));
    return ['All', ...Array.from(eventNames)];
  }, [portfolioItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return randomizedAllItems;
    return portfolioItems.filter(p => p.eventName === activeCategory);
  }, [portfolioItems, activeCategory, randomizedAllItems]);

  const handleOpenMedia = (media) => {
    if (media.type === 'album') {
      setActiveAlbumPhotos(media.photos);
      setActiveAlbumMusic(media.musicUrl);
      setAlbumOpen(true);
    } else if (media.type === 'video') {
      setActiveVideoUrl(media.url);
    } else if (media.type === 'photo') {
      // Find the index of the clicked photo within the CURRENT filtered items
      const photoItems = filteredItems.filter(i => i.category === 'photo');
      const idx = photoItems.findIndex(p => p.id === media.id);
      if (idx !== -1) {
        setPhotoLightboxIndex(idx);
        setPhotoLightboxOpen(true);
      }
    }
  };

  return (
    <div>
      <Hero />
      <ServicesSection />
      <CinematicSequence />

      <section ref={portfolioRef} id="portfolio" className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
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

        {portfolioItems.length === 0 ? (
          <div className="text-center py-20 text-silver/40">
            <p>Portfolio is currently being curated.</p>
          </div>
        ) : (
          <PortfolioGrid items={filteredItems} onOpenMedia={handleOpenMedia} />
        )}
      </section>

      <TextMarquee />
      <div className="h-[70vh] w-full">
        <Infinitegrid photos={portfolioItems.filter(p => p.category === 'photo')} />
      </div>
      <AboutSection />
      <ContactFooter />

      <AnimatePresence>
        {albumOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EAlbum photos={activeAlbumPhotos} musicUrl={activeAlbumMusic} onExit={() => setAlbumOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVideoUrl && (
          <VideoModal url={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {photoLightboxOpen && (
          <PublicPhotoLightbox 
            photos={filteredItems.filter(i => i.category === 'photo')} 
            initialIndex={photoLightboxIndex} 
            onClose={() => setPhotoLightboxOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
