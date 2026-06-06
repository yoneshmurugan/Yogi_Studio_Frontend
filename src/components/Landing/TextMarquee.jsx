import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function TextMarquee() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Move right-to-left
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  // Move left-to-right
  const x2 = useTransform(scrollYProgress, [0, 1], ['-50%', '0%']);

  return (
    <section ref={containerRef} className="py-24 overflow-hidden bg-black flex flex-col gap-8 select-none pointer-events-none">
      
      <motion.div style={{ x: x1 }} className="whitespace-nowrap flex">
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest outline-text-gold font-bold leading-none pr-8">
          Yogi Digital Studio • Capturing Future Memories • 
        </h2>
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest outline-text-gold font-bold leading-none pr-8">
          Yogi Digital Studio • Capturing Future Memories • 
        </h2>
      </motion.div>

      <motion.div style={{ x: x2 }} className="whitespace-nowrap flex">
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest text-silver/10 font-bold leading-none pr-8">
          Cinematic Videography • Luxury Weddings • Portraits • 
        </h2>
        <h2 className="text-[10vw] md:text-[8vw] font-serif uppercase tracking-widest text-silver/10 font-bold leading-none pr-8">
          Cinematic Videography • Luxury Weddings • Portraits • 
        </h2>
      </motion.div>

    </section>
  );
}
