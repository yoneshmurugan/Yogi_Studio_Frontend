import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const images = [
  "https://picsum.photos/seed/cinematic-seq-1/1920/1080",
  "https://picsum.photos/seed/cinematic-seq-2/1920/1080",
  "https://picsum.photos/seed/cinematic-seq-3/1920/1080",
  "https://picsum.photos/seed/cinematic-seq-4/1920/1080",
];

const titles = [
  "Pre-Wedding Editorials",
  "The Grand Ceremony",
  "Intimate Portraits",
  "Cinematic Highlights"
];

export default function CinematicSequence() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate opacities for the layered images
  // Base image (index 0) is always visible. 
  // Next images fade in sequentially on top.
  const opacity1 = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const opacity3 = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  const opacities = [1, opacity1, opacity2, opacity3];

  // Scale effect for the entire sequence to add subtle depth while pinned
  const globalScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-black">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Images layered on top of each other */}
        {images.map((src, index) => {
          return (
            <motion.div
              key={index}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: opacities[index],
                scale: globalScale,
              }}
            >
              <img
                src={src}
                alt={titles[index]}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </motion.div>
          );
        })}

        {/* Text sequence that fades in and out with the images */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {titles.map((title, index) => {
            // Text fades in when its image fades in, and fades out when the NEXT image fades in
            let textOpacity;
            
            if (index === 0) {
               textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);
            } else if (index === 1) {
               textOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.45, 0.6], [0, 1, 1, 0]);
            } else if (index === 2) {
               textOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.75, 0.9], [0, 1, 1, 0]);
            } else {
               textOpacity = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 1, 1]);
            }

            const yOffset = useTransform(scrollYProgress, 
              [Math.max(0, index * 0.3 - 0.1), index * 0.3], 
              [40, 0]
            );

            return (
              <motion.div
                key={title}
                className="absolute text-center px-6"
                style={{ opacity: textOpacity, y: yOffset }}
              >
                <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white drop-shadow-2xl">
                  {title}
                </h3>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll Progress Indicator for the pinned section */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gold"
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
          />
        </div>
      </div>
    </section>
  );
}
