import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function TextMarquee() {
  return (
    <section className="py-12 md:py-24 overflow-hidden bg-black flex flex-col gap-4 md:gap-8 select-none pointer-events-none">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
          display: flex;
          width: fit-content;
          animation: marquee-left 30s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: fit-content;
          animation: marquee-right 35s linear infinite;
        }
      `}</style>

      {/* Move right-to-left */}
      <div className="animate-marquee-left whitespace-nowrap">
        {[1, 2, 3, 4].map((i) => (
          <h2 key={i} className="text-5xl md:text-[8vw] font-serif uppercase tracking-widest text-[#d4af37]/60 font-bold leading-none pr-8">
            Yogi Digital Studio • 
          </h2>
        ))}
      </div>

      {/* Move left-to-right */}
      <div className="animate-marquee-right whitespace-nowrap">
        {[1, 2, 3, 4].map((i) => (
          <h2 key={i} className="text-3xl md:text-[4.5vw] font-serif uppercase tracking-widest text-silver/20 font-bold leading-none pr-8">
            Cinematic Videography • Luxury Weddings • Portraits • 
          </h2>
        ))}
      </div>

    </section>
  );
}
