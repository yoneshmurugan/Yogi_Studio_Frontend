import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function TextMarquee() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Move right-to-left — starts with text at the left edge when section enters view
  const x1 = useTransform(scrollYProgress, [0, 1], ['50%', '-50%']);
  // Move left-to-right
  const x2 = useTransform(scrollYProgress, [0, 1], ['-80%', '0%']);

  return (
    <section ref={containerRef} className="py-24 overflow-hidden bg-black flex flex-col gap-8 select-none pointer-events-none">
      
      <motion.div style={{ x: x1 }} className="whitespace-nowrap flex">
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest text-[#d4af37]/60 font-bold leading-none pr-8">
          Yogi Digital Studio • 
        </h2>
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest text-[#d4af37]/60 font-bold leading-none pr-8">
          Yogi Digital Studio • 
        </h2>
      </motion.div>

      <motion.div style={{ x: x2 }} className="whitespace-nowrap flex">
        <h2 className="text-[6vw] md:text-[4.5vw] font-serif uppercase tracking-widest text-silver/20 font-bold leading-none pr-8">
          Cinematic Videography • Luxury Weddings • Portraits • 
        </h2>
        <h2 className="text-[6vw] md:text-[4.5vw] font-serif uppercase tracking-widest text-silver/20 font-bold leading-none pr-8">
          Cinematic Videography • Luxury Weddings • Portraits • 
        </h2>
      </motion.div>

    </section>
  );
}
