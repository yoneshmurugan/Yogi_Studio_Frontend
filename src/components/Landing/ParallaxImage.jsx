import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxImage({ src, alt = '', speed = 0.3, className = '', overlay = true }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-full object-cover scale-110"
        loading="lazy"
      />
      {overlay && (
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0.6]) }}
          className="absolute inset-0 bg-black pointer-events-none"
        />
      )}
    </div>
  );
}
