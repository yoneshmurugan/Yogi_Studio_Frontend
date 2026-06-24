import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const img0 = "https://ik.imagekit.io/yogistudio/A46A5802%20copy.webp";
const img1 = "https://ik.imagekit.io/yogistudio/C-2285%20copy.webp";
const img2 = "https://ik.imagekit.io/yogistudio/CM_1694.webp";
const img3 = "https://ik.imagekit.io/yogistudio/IMG_9561.webp";
const img4 = "https://ik.imagekit.io/yogistudio/0G1A7726.webp";

const sequenceData = [
  { title: "Coming of Age Ceremony", image: img0 },
  { title: "Traditional Photography & Videography", image: img1 },
  { title: "Candid Photography", image: img2 },
  { title: "Pre & Post-Wedding Shoots", image: img3 },
  { title: "Cinematic Wedding Films", image: img4 },
];

// TEXT opacity
const TEXT_OPACITY = [
  { input: [0, 0.12, 0.16, 1], output: [1, 1, 0, 0] },
  { input: [0, 0.18, 0.22, 0.32, 0.36, 1], output: [0, 0, 1, 1, 0, 0] },
  { input: [0, 0.38, 0.42, 0.52, 0.56, 1], output: [0, 0, 1, 1, 0, 0] },
  { input: [0, 0.58, 0.62, 0.72, 0.76, 1], output: [0, 0, 1, 1, 0, 0] },
  { input: [0, 0.78, 0.82, 1], output: [0, 0, 1, 1] },
];

// TEXT y-offset
const TEXT_Y = [
  { input: [0, 0.12, 0.16, 1], output: [0, 0, -30, -30] },
  { input: [0, 0.18, 0.22, 0.32, 0.36, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.38, 0.42, 0.52, 0.56, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.58, 0.62, 0.72, 0.76, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.78, 0.82, 1], output: [30, 30, 0, 0] },
];

// IMAGE opacity
const IMG_OPACITY = [
  { input: [0, 1], output: [1, 1] },
  { input: [0, 0.16, 0.20, 1], output: [0, 0, 1, 1] },
  { input: [0, 0.36, 0.40, 1], output: [0, 0, 1, 1] },
  { input: [0, 0.56, 0.60, 1], output: [0, 0, 1, 1] },
  { input: [0, 0.76, 0.80, 1], output: [0, 0, 1, 1] },
];

function SlideText({ index, scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, TEXT_OPACITY[index].input, TEXT_OPACITY[index].output);
  const y = useTransform(scrollYProgress, TEXT_Y[index].input, TEXT_Y[index].output);

  return (
    <motion.div
      className="absolute text-center px-6"
      style={{ opacity, y, willChange: 'opacity, transform' }}
    >
      <h3 className="font-serif text-2xl md:text-5xl lg:text-6xl font-light text-white drop-shadow-2xl">
        {sequenceData[index].title}
      </h3>
    </motion.div>
  );
}

function SlideImage({ index, scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, IMG_OPACITY[index].input, IMG_OPACITY[index].output);

  return (
    <motion.div className="absolute inset-0 w-full h-full" style={{ opacity, willChange: 'opacity' }}>
      <img
        src={sequenceData[index].image}
        alt={sequenceData[index].title}
        className="w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
    </motion.div>
  );
}

export default function CinematicSequence() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Disable globalScale on mobile to save GPU compositing
  const globalScale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [1, 1] : [1, 1.05]
  );

  return (
    <section
      ref={containerRef}
      className={`relative bg-black ${isMobile ? 'h-[250vh]' : 'h-[350vh]'}`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Images stacked */}
        <motion.div
          className="w-full h-full"
          style={isMobile ? { willChange: 'auto' } : { scale: globalScale, willChange: 'transform' }}
        >
          <SlideImage index={0} scrollYProgress={scrollYProgress} />
          <SlideImage index={1} scrollYProgress={scrollYProgress} />
          <SlideImage index={2} scrollYProgress={scrollYProgress} />
          <SlideImage index={3} scrollYProgress={scrollYProgress} />
          <SlideImage index={4} scrollYProgress={scrollYProgress} />
        </motion.div>

        {/* Titles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SlideText index={0} scrollYProgress={scrollYProgress} />
          <SlideText index={1} scrollYProgress={scrollYProgress} />
          <SlideText index={2} scrollYProgress={scrollYProgress} />
          <SlideText index={3} scrollYProgress={scrollYProgress} />
          <SlideText index={4} scrollYProgress={scrollYProgress} />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 w-32 md:w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
          />
        </div>
      </div>
    </section>
  );
}
