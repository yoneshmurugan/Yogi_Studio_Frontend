import { ReactLenis } from "lenis/react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  animate,
} from "framer-motion";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { useRef, useEffect } from "react";
import yogiLogo from "../../assets/yogi-logo-removebg-preview.png";

// Inject shimmer / particle keyframes once
const shimmerCSS = `
@keyframes floatDust {
  0%   { transform: translateY(0px) translateX(0px) scale(1);   opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 0.6; }
  100% { transform: translateY(-120px) translateX(var(--drift)) scale(0.4); opacity: 0; }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.18; transform: scale(1);   }
  50%       { opacity: 0.32; transform: scale(1.08); }
}
@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes lineExpand {
  0%   { scaleX: 0; opacity: 0; }
  50%  { opacity: 1; }
  100% { scaleX: 1; opacity: 0.35; }
}
`;

if (typeof document !== "undefined") {
  const styleId = "yogi-shimmer-css";
  if (!document.getElementById(styleId)) {
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = shimmerCSS;
    document.head.appendChild(s);
  }
}

// Individual dust particle
const DustParticle = ({ style }) => (
  <span
    style={{
      position: "absolute",
      width: 3,
      height: 3,
      borderRadius: "50%",
      background: "radial-gradient(circle, #d4af37 0%, transparent 70%)",
      animation: `floatDust ${style.duration}s ${style.delay}s infinite ease-in`,
      ...style,
    }}
  />
);

export const SmoothScrollHero = () => {
  return (
    <div className="bg-zinc-950">
      <ReactLenis
        root
        options={{
          lerp: 0.05,
        }}
      >
        <Hero />
        <StudioDetails />
      </ReactLenis>
    </div>
  );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />
      <ParallaxImages />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();

  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"]
  );
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(/src/assets/IMG-20240423-WA0045.jpg)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] pointer-events-none relative z-10">
      <ParallaxMedia
        src="src/assets/0G1A7726.jpg"
        alt="Wedding photography"
        start={-200}
        end={200}
        className="w-1/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      <ParallaxMedia
        
        src="src/assets/IMG-20240503-WA0019.jpg"
        alt="Sample Video 1"
        start={200}
        end={-250}
        className="mx-auto w-2/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      <ParallaxMedia
        src="src/assets/IMG-20240503-WA0019.jpg"
        alt="Event photography"
        start={-200}
        end={200}
        className="ml-auto w-1/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      <ParallaxMedia
        
        src="src/assets/002.jpg"
        alt="Sample Video 2"
        start={0}
        end={-500}
        className="ml-24 w-5/12 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
};

const ParallaxMedia = ({ className, alt, src, start, end, isVideo }) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.div
      ref={ref}
      style={{ transform, opacity }}
      className={`${className} overflow-hidden`}
    >
      {isVideo ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto object-cover"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
        />
      )}
    </motion.div>
  );
};

// Dust particles data
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${5 + i * 5.2}%`,
  bottom: `${10 + ((i * 37) % 55)}%`,
  duration: 4 + (i % 5),
  delay: (i * 0.45) % 6,
  "--drift": `${(i % 2 === 0 ? 1 : -1) * (15 + (i % 20))}px`,
}));

const StudioDetails = () => {
  return (
    <section
      id="studio-details"
      className="relative mx-auto max-w-5xl px-4 py-48 text-white flex flex-col items-center text-center z-20 overflow-hidden"
    >
      {/* ── Ambient radial glow behind logo ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.04) 45%, transparent 70%)",
          animation: "pulseGlow 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Outer ring arc (thin, slow spin) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          width: 520,
          height: 520,
          borderRadius: "50%",
          border: "1px solid rgba(212,175,55,0.08)",
          animation: "slowSpin 60s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating gold dust ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PARTICLES.map((p, i) => (
          <DustParticle key={i} style={p} />
        ))}
      </div>

      {/* ── Logo + expanding line accents ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ ease: "easeInOut", duration: 1.2 }}
        className="mb-8 w-full flex flex-col items-center gap-5"
      >
        {/* Expanding horizontal lines above logo */}
        <div className="flex items-center gap-4 w-full justify-center">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            style={{ transformOrigin: "right" }}
            className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
          />
          <span style={{ color: "#d4af37", opacity: 0.5, fontSize: 10, letterSpacing: "0.3em" }}>
            ✦
          </span>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            style={{ transformOrigin: "left" }}
            className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
          />
        </div>

        {/* Logo — slow continuous rotation for "alive" feel */}
        <div style={{ position: "relative" }}>
          <img
            src={yogiLogo}
            alt="Yogi Digital Studio"
            style={{
              mixBlendMode: "lighten",
              opacity: 1,
            }}
            className="w-[80vw] max-w-xl object-contain select-none pointer-events-none"
          />
        </div>

        {/* Expanding horizontal lines below logo */}
        <div className="flex items-center gap-4 w-full justify-center">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
            style={{ transformOrigin: "right" }}
            className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
          />
          {/* Decorative dot row */}
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3, 4].map((d) => (
              <motion.span
                key={d}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + d * 0.07, duration: 0.4 }}
                style={{
                  display: "inline-block",
                  width: d === 2 ? 6 : 3,
                  height: d === 2 ? 6 : 3,
                  borderRadius: "50%",
                  background: "#d4af37",
                  opacity: d === 2 ? 0.9 : 0.4,
                }}
              />
            ))}
          </div>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
            style={{ transformOrigin: "left" }}
            className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
          />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75, delay: 0.2 }}
        className="mb-8 text-4xl md:text-6xl font-serif text-[#d4af37] font-light drop-shadow-lg"
      >
        Yogi Digital Studio
      </motion.h1>
      <motion.p
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75, delay: 0.4 }}
        className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
      >
        Where art meets emotion. We capture your most precious moments with elegant, cinematic, and timeless photography.{" "}
        Experience the opulent digital studio — crafting future memories through high-fashion wedding photography &amp; cinematic videography.
      </motion.p>
    </section>
  );
};

export default SmoothScrollHero;
