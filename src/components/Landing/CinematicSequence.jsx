import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const sequenceData = [
  {
    title: "Cinematic Wedding Films",
    image: "src/assets/0G1A7726.jpg"
  },
  {
    title: "Candid Photography",
    image: ""
  },
  {
    title: "Traditional Photography & Videography",
    image: "src/assets/IMG_9561.JPG"
  },
  {
    title: "Pre & Post-Wedding Shoots",
    image: "src/assets/IMG-20240503-WA0022.jpg"
  },
  {
    title: "Baby & Family Portraits",
    image: "src/assets/IMG-20240423-WA0055.jpg"
  }
];

// ────────────────────────────────────────────────────
// Full-range [0→1] keyframes so there's ZERO ambiguity
// about opacity clamping. Every title is explicitly 0
// outside its active window.
// ────────────────────────────────────────────────────

// TEXT opacity: [scrollProgress] → [opacity]
const TEXT_OPACITY = [
  // 0: visible at start, fades out before slot 1, explicitly 0 for the rest
  { input: [0, 0.12, 0.16, 1], output: [1, 1, 0, 0] },
  // 1: invisible → fade in → hold (pause) → fade out → invisible
  { input: [0, 0.18, 0.22, 0.32, 0.36, 1], output: [0, 0, 1, 1, 0, 0] },
  // 2
  { input: [0, 0.38, 0.42, 0.52, 0.56, 1], output: [0, 0, 1, 1, 0, 0] },
  // 3
  { input: [0, 0.58, 0.62, 0.72, 0.76, 1], output: [0, 0, 1, 1, 0, 0] },
  // 4: last title stays visible at end
  { input: [0, 0.78, 0.82, 1], output: [0, 0, 1, 1] },
];

// TEXT y-offset: same breakpoints, slides up/down 30px
const TEXT_Y = [
  { input: [0, 0.12, 0.16, 1], output: [0, 0, -30, -30] },
  { input: [0, 0.18, 0.22, 0.32, 0.36, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.38, 0.42, 0.52, 0.56, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.58, 0.62, 0.72, 0.76, 1], output: [30, 30, 0, 0, -30, -30] },
  { input: [0, 0.78, 0.82, 1], output: [30, 30, 0, 0] },
];

// IMAGE opacity: each stacks on top; once faded in it stays
const IMG_OPACITY = [
  { input: [0, 1], output: [1, 1] },       // always visible (base layer)
  { input: [0.16, 0.20], output: [0, 1] },
  { input: [0.36, 0.40], output: [0, 1] },
  { input: [0.56, 0.60], output: [0, 1] },
  { input: [0.76, 0.80], output: [0, 1] },
];

// ── Per-item hook components ──

function SlideText({ index, scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, TEXT_OPACITY[index].input, TEXT_OPACITY[index].output);
  const y = useTransform(scrollYProgress, TEXT_Y[index].input, TEXT_Y[index].output);

  return (
    <motion.div
      className="absolute text-center px-6"
      style={{ opacity, y }}
    >
      <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light text-white drop-shadow-2xl">
        {sequenceData[index].title}
      </h3>
    </motion.div>
  );
}

function SlideImage({ index, scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, IMG_OPACITY[index].input, IMG_OPACITY[index].output);

  return (
    <motion.div className="absolute inset-0 w-full h-full" style={{ opacity }}>
      <img
        src={sequenceData[index].image}
        alt={sequenceData[index].title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
    </motion.div>
  );
}

// ── Main component ──

export default function CinematicSequence() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const globalScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section ref={containerRef} className="relative h-[350vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Images stacked */}
        <motion.div className="w-full h-full" style={{ scale: globalScale }}>
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
