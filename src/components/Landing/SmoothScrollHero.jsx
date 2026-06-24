import { ReactLenis } from "lenis/react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { useRef, useEffect, useState } from "react";
import yogiLogo from "../../assets/yogi-logo-removebg-preview.png";
import vidSample from "../../assets/ReelIMG.mp4";
const imgHero = "https://ik.imagekit.io/yogistudio/Hero.jpg";
const imgWedding = "https://ik.imagekit.io/yogistudio/IMG_5775.webp";
const imgVideo1 = "https://ik.imagekit.io/yogistudio/Heroimg.webp";
const imgEvent = "https://ik.imagekit.io/yogistudio/091A8583.webp";

// ── Mobile detection hook ──
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// Lazy-load SplashCursor only on desktop
let SplashCursorLazy = null;
const getSplashCursor = () => {
  if (!SplashCursorLazy) {
    SplashCursorLazy = import("./SplashCursor").then(m => m.default);
  }
  return SplashCursorLazy;
};

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

// ── Desktop SplashCursor wrapper ──
function DesktopSplashCursor() {
  const [Comp, setComp] = useState(null);
  useEffect(() => {
    getSplashCursor().then(C => setComp(() => C));
  }, []);
  if (!Comp) return null;
  return (
    <Comp
      COLOR="#d4af37"
      SIM_RESOLUTION={64}
      DYE_RESOLUTION={512}
      SPLAT_RADIUS={0.08}
      SPLAT_FORCE={3000}
      DENSITY_DISSIPATION={4.5}
      VELOCITY_DISSIPATION={3.0}
      PRESSURE_ITERATIONS={10}
    />
  );
}

// ── Mobile glow replacement ──
function MobileGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 60%)",
      }}
    />
  );
}

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

const Hero = () => {
  const isMobile = useIsMobile();
  const SECTION_HEIGHT = isMobile ? 1500 : 2500;

  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage sectionHeight={SECTION_HEIGHT} isMobile={isMobile} />
      <ParallaxImages isMobile={isMobile} />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

const CenterImage = ({ sectionHeight, isMobile }) => {
  const { scrollY } = useScroll();

  // Desktop: fancy clipPath polygon reveal (GPU can handle it)
  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  // Desktop: background-size zoom
  const backgroundSize = useTransform(
    scrollY,
    [0, sectionHeight + 500],
    ["170%", "100%"]
  );

  // Mobile: GPU-compositable scale on <img> (much cheaper than backgroundSize)
  const imgScale = useTransform(
    scrollY,
    [0, sectionHeight + 500],
    [1.4, 1]
  );

  const opacity = useTransform(
    scrollY,
    [sectionHeight, sectionHeight + 500],
    [1, 0]
  );

  // Mobile: simple inset clip via overflow:hidden + scale (no polygon recalc)
  const mobileClipInset = useTransform(scrollY, [0, 1500], [15, 0]);
  const mobileInset = useMotionTemplate`${mobileClipInset}%`;

  if (isMobile) {
    // Mobile path: uses transform:scale on an <img> (GPU layer) + inset for reveal
    return (
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden relative"
        style={{ opacity }}
      >
        <motion.div
          className="absolute overflow-hidden"
          style={{
            top: mobileInset,
            left: mobileInset,
            right: mobileInset,
            bottom: mobileInset,
            willChange: 'top, left, right, bottom',
          }}
        >
          <motion.img
            src={imgHero}
            alt="Hero"
            className="w-full h-full object-cover"
            style={{
              scale: imgScale,
              willChange: 'transform',
            }}
          />
        </motion.div>
        {/* Watermark Logo */}
        <img
          src={yogiLogo}
          alt="Yogi Studio Watermark"
          className="absolute bottom-6 right-6 w-24 opacity-[0.3] pointer-events-none select-none drop-shadow-md z-10"
        />
      </motion.div>
    );
  }

  // Desktop path: original fancy clipPath + backgroundSize
  return (
    <motion.div
      className="sticky top-0 h-screen w-full overflow-hidden relative"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage: `url(${imgHero})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Watermark Logo */}
      <img
        src={yogiLogo}
        alt="Yogi Studio Watermark"
        className="absolute bottom-12 right-12 w-40 opacity-[0.3] pointer-events-none select-none drop-shadow-md"
      />
    </motion.div>
  );
};

const ParallaxImages = ({ isMobile }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] pointer-events-none relative z-10">
      <ParallaxMedia
        src={imgWedding}
        alt="Wedding photography"
        start={isMobile ? -80 : -200}
        end={isMobile ? 80 : 200}
        className="w-1/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      <ParallaxMedia
        src={imgVideo1}
        alt="Sample Video 1"
        start={isMobile ? 80 : 200}
        end={isMobile ? -100 : -250}
        className="mx-auto w-2/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      <ParallaxMedia
        src={imgEvent}
        alt="Event photography"
        start={isMobile ? -80 : -200}
        end={isMobile ? 80 : 200}
        className="ml-auto w-1/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      />
      {/* Video always shown on all devices */}
      <ParallaxMedia
        isVideo={true}
        src={vidSample}
        alt="Sample Video 2"
        start={0}
        end={isMobile ? -200 : -500}
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

  return (
    <motion.div
      ref={ref}
      style={{ y, scale, opacity, willChange: 'transform, opacity' }}
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
          loading="lazy"
          decoding="async"
        />
      )}
    </motion.div>
  );
};

// Dust particles data — fewer on mobile, handled by count in render
const PARTICLES_DESKTOP = Array.from({ length: 18 }, (_, i) => ({
  left: `${5 + i * 5.2}%`,
  bottom: `${10 + ((i * 37) % 55)}%`,
  duration: 4 + (i % 5),
  delay: (i * 0.45) % 6,
  "--drift": `${(i % 2 === 0 ? 1 : -1) * (15 + (i % 20))}px`,
}));

const PARTICLES_MOBILE = PARTICLES_DESKTOP.slice(0, 6);

const StudioDetails = () => {
  const isMobile = useIsMobile();
  const particles = isMobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP;
  const glowSize = isMobile ? 280 : 600;
  const ringSize = isMobile ? 240 : 520;

  return (
    <div className="relative w-full overflow-hidden">
      {/* SplashCursor on desktop only, CSS glow on mobile */}
      {isMobile ? <MobileGlow /> : <DesktopSplashCursor />}
      <section
        id="studio-details"
        className="relative mx-auto max-w-5xl px-4 py-24 md:py-48 text-white flex flex-col items-center text-center z-20"
      >
        {/* ── Ambient radial glow behind logo ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            width: glowSize,
            height: glowSize,
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
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.08)",
            animation: "slowSpin 60s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* ── Floating gold dust ── */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {particles.map((p, i) => (
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
              className="h-px flex-1 max-w-[120px] md:max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
            />
            <span style={{ color: "#d4af37", opacity: 0.5, fontSize: 10, letterSpacing: "0.3em" }}>
              ✦
            </span>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
              style={{ transformOrigin: "left" }}
              className="h-px flex-1 max-w-[120px] md:max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
            />
          </div>

          {/* Logo */}
          <div style={{ position: "relative" }}>
            <img
              src={yogiLogo}
              alt="Yogi Digital Studio"
              style={{
                mixBlendMode: "lighten",
                opacity: 1,
              }}
              className="w-[85vw] md:w-[80vw] max-w-xl object-contain select-none pointer-events-none"
            />
          </div>

          {/* Expanding horizontal lines below logo */}
          <div className="flex items-center gap-4 w-full justify-center">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
              style={{ transformOrigin: "right" }}
              className="h-px flex-1 max-w-[120px] md:max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
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
              className="h-px flex-1 max-w-[120px] md:max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.2 }}
          className="mb-0 text-3xl md:text-6xl font-serif text-[#d4af37] font-light drop-shadow-lg"
        >
          Yogi Digital Studio
        </motion.h1>
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.3 }}
          className="mt-3 md:mt-4 mb-8 md:mb-12 block"
        >
          <span className="text-[#d4af37] opacity-80 tracking-[0.4em] text-[10px] md:text-xs uppercase">
            Since 2001
          </span>
        </motion.div>
        <motion.p
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.4 }}
          className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-2"
        >
          Where art meets emotion. We capture your most precious moments with elegant, cinematic, and timeless photography.{" "}
          Experience the opulent digital studio — crafting future memories through high-fashion wedding photography &amp; cinematic videography.
        </motion.p>
      </section>
    </div>
  );
};

export default SmoothScrollHero;
