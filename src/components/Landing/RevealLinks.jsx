import React from "react";
import { motion } from "framer-motion";

export const RevealLinks = () => {
  return (
    <section className="grid place-content-center gap-4 px-8 py-12 text-white">
      <FlipLink href="https://www.instagram.com/yogistudio_official?igsh=NXFlM3RpOG82M2R0">Instagram</FlipLink>
      <FlipLink href="https://youtube.com/@yogistudio-official?si=w81KIpSqR3SXeSWk">YouTube</FlipLink>
      <FlipLink href="https://wa.me/919842775676">WhatsApp</FlipLink>
    </section>
  );
};

const DURATION = 0.25;
const STAGGER = 0.025;

const FlipLink = ({ children, href }) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden whitespace-nowrap text-3xl font-serif font-light uppercase sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl hover:text-gold transition-colors duration-300"
      style={{
        lineHeight: 1.1,
      }}
    >
      <div>
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block text-gold"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
};
