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
import imgHeroMobile from "../../assets/Heromobile.webp";
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
      SIM_RESOLUTION={128}
      DYE_RESOLUTION={1024}
      SPLAT_RADIUS={0.4}
      SPLAT_FORCE={6000}
      DENSITY_DISSIPATION={2.5}
      VELOCITY_DISSIPATION={1.5}
      PRESSURE_ITERATIONS={15}
      COLOR_UPDATE_SPEED={10}
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
  const SECTION_HEIGHT = isMobile ? 2200 : 2500;

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

  // Scroll hint fades out quickly within the first 100px of scrolling
  const hintOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  // ClipPath polygon reveal — starts as centered box, expands to full screen
  const clip1 = useTransform(scrollY, [0, isMobile ? 800 : 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, isMobile ? 800 : 1500], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  // Scale zoom — image starts zoomed in and settles to normal
  const imgScale = useTransform(
    scrollY,
    [0, sectionHeight + 500],
    [isMobile ? 1.3 : 1.7, 1]
  );

  const opacity = useTransform(
    scrollY,
    [sectionHeight, sectionHeight + 500],
    [1, 0]
  );

  // Desktop: background-size zoom (must be called before any early return)
  const backgroundSize = useTransform(
    scrollY,
    [0, sectionHeight + 500],
    ["170%", "100%"]
  );

  if (isMobile) {
    return (
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden relative">
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ clipPath, opacity }}
        >
          <motion.img
            src={imgHeroMobile}
            alt="Hero"
            className="w-full h-full object-cover"
            style={{
              scale: imgScale,
              objectPosition: 'center top',
              willChange: 'transform',
            }}
          />
        </motion.div>
        
        {/* Watermark Logo */}
        <img
          src={yogiLogo}
          alt="Yogi Studio Watermark"
          className="absolute bottom-6 right-6 w-36 opacity-[0.3] pointer-events-none select-none drop-shadow-md z-10"
        />
        
        {/* Scroll Hint Mobile */}
        <motion.div 
          style={{ opacity: hintOpacity }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center animate-bounce z-20 pointer-events-none"
        >
          <span className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-[0.2em] mb-2 drop-shadow-md">Scroll to Explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#d4af37] to-transparent" />
        </motion.div>
      </div>
    );
  }

  // Desktop path: original fancy clipPath + backgroundSize
  return (
    <div className="sticky top-0 h-screen w-full overflow-hidden relative">
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath,
          backgroundSize,
          opacity,
          backgroundImage: `url(${imgHero})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Watermark Logo */}
      <img
        src={yogiLogo}
        alt="Yogi Studio Watermark"
        className="absolute bottom-12 right-12 w-40 opacity-[0.3] pointer-events-none select-none drop-shadow-md z-10"
      />
      
      {/* Scroll Hint Desktop */}
      <motion.div 
        style={{ opacity: hintOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center animate-bounce z-20 pointer-events-none"
      >
        <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-[0.3em] mb-3 drop-shadow-md">Scroll to Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#d4af37] to-transparent" />
      </motion.div>
    </div>
  );
};

const ParallaxImages = ({ isMobile }) => {
  return (
    <div className="mx-auto max-w-5xl px-2 md:px-4 pt-[150px] md:pt-[200px] pointer-events-none relative z-10 flex flex-col md:block">
      <ParallaxMedia
        src={imgWedding}
        alt="Wedding photography"
        start={isMobile ? -20 : -200}
        end={isMobile ? 20 : 200}
        className="w-[75%] ml-2 md:ml-0 md:w-1/3 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10"
      />
      <ParallaxMedia
        src={imgVideo1}
        alt="Sample Video 1"
        start={isMobile ? 30 : 200}
        end={isMobile ? -30 : -250}
        className="ml-auto mr-2 w-[90%] md:w-2/3 mt-[-10px] md:mt-0 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-20"
      />
      <ParallaxMedia
        src={imgEvent}
        alt="Event photography"
        start={isMobile ? -20 : -200}
        end={isMobile ? 20 : 200}
        className="w-[70%] ml-4 md:ml-auto md:w-1/3 mt-[-15px] md:mt-0 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10"
      />
      {/* Video always shown on all devices */}
      <ParallaxMedia
        isVideo={true}
        src={vidSample}
        alt="Sample Video 2"
        start={0}
        end={isMobile ? -60 : -500}
        className="ml-auto mr-4 w-[60%] md:ml-24 md:w-5/12 mt-[-20px] md:mt-0 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-20"
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
          controls={false}
          disablePictureInPicture
          poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          className="w-full h-auto object-cover pointer-events-none"
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

  if (isMobile) {
    // Mobile: static section without SplashCursor pause
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden">
        {/* Use static glow on mobile to save GPU rendering */}
        <MobileGlow />

        <section
            id="studio-details"
            className="relative h-full w-full flex flex-col items-center justify-center text-white text-center z-20 px-4 py-12"
          >
            {/* ── Top area: Logo + decorations ── */}
            <div className="flex-shrink-0 w-full flex flex-col items-center pt-4">
              {/* Ambient radial glow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: glowSize,
                  height: glowSize,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.04) 45%, transparent 70%)",
                  animation: "pulseGlow 4s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              {/* Outer ring */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: ringSize,
                  height: ringSize,
                  borderRadius: "50%",
                  border: "1px solid rgba(212,175,55,0.08)",
                  animation: "slowSpin 60s linear infinite",
                  pointerEvents: "none",
                }}
              />
              {/* Floating gold dust */}
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {particles.map((p, i) => (
                  <DustParticle key={i} style={p} />
                ))}
              </div>

              {/* Logo + line accents */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "150px" }}
                transition={{ ease: "easeInOut", duration: 1.2 }}
                className="w-full flex flex-col items-center gap-4"
              >
                {/* Lines above logo */}
                <div className="flex items-center gap-4 w-full justify-center">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                    style={{ transformOrigin: "right" }}
                    className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-[#d4af37] to-transparent"
                  />
                  <span style={{ color: "#d4af37", opacity: 0.5, fontSize: 10, letterSpacing: "0.3em" }}>✦</span>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                    style={{ transformOrigin: "left" }}
                    className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-[#d4af37] to-transparent"
                  />
                </div>
                {/* Logo */}
                <img
                  src={yogiLogo}
                  alt="Yogi Digital Studio"
                  style={{ mixBlendMode: "lighten" }}
                  className="w-[95vw] md:w-[85vw] max-w-xl object-contain select-none pointer-events-none"
                />
                {/* Lines below logo */}
                <div className="flex items-center gap-4 w-full justify-center">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                    style={{ transformOrigin: "right" }}
                    className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-[#d4af37] to-transparent"
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2, 3, 4].map((d) => (
                      <motion.span
                        key={d}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "150px" }}
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
                    viewport={{ once: true, margin: "150px" }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                    style={{ transformOrigin: "left" }}
                    className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-[#d4af37] to-transparent"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: 0.2 }}
                className="mb-0 text-3xl font-serif text-[#d4af37] font-light drop-shadow-lg mt-4"
              >
                Yogi Digital Studio
              </motion.h1>
              <motion.div
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: 0.3 }}
                className="mt-2 block"
              >
                <span className="text-[#d4af37] opacity-80 tracking-[0.4em] text-[10px] uppercase">
                  Since 2001
                </span>
              </motion.div>
            </div>

            {/* ── Bottom area: Description text ── */}
            <motion.p
              initial={{ y: 48, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
              transition={{ ease: "easeInOut", duration: 0.75, delay: 0.4 }}
              className="mt-12 text-gray-300 text-base max-w-2xl mx-auto leading-relaxed px-2 flex-shrink-0"
            >
              Where art meets emotion. We capture your most precious moments with elegant, cinematic, and timeless photography.{" "}
              Experience the opulent digital studio — crafting future memories through high-fashion wedding photography &amp; cinematic videography.
            </motion.p>
          </section>
      </div>
    );
  }

  // ── Desktop: unchanged ──
  return (
    <div className="relative w-full overflow-hidden">
      <DesktopSplashCursor />
      <section
        id="studio-details"
        className="relative mx-auto max-w-5xl px-4 py-48 text-white flex flex-col items-center text-center z-20"
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
            background: "radial-gradient(circle, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.04) 45%, transparent 70%)",
            animation: "pulseGlow 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* ── Outer ring arc ── */}
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
                viewport={{ once: true, margin: "150px" }}
          transition={{ ease: "easeInOut", duration: 1.2 }}
          className="mb-8 w-full flex flex-col items-center gap-5"
        >
          {/* Expanding horizontal lines above logo */}
          <div className="flex items-center gap-4 w-full justify-center">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
              style={{ transformOrigin: "right" }}
              className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
            />
            <span style={{ color: "#d4af37", opacity: 0.5, fontSize: 10, letterSpacing: "0.3em" }}>✦</span>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
              style={{ transformOrigin: "left" }}
              className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
            />
          </div>
          {/* Logo */}
          <div style={{ position: "relative" }}>
            <img
              src={yogiLogo}
              alt="Yogi Digital Studio"
              style={{ mixBlendMode: "lighten", opacity: 1 }}
              className="w-[80vw] max-w-xl object-contain select-none pointer-events-none"
            />
          </div>
          {/* Expanding horizontal lines below logo */}
          <div className="flex items-center gap-4 w-full justify-center">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
                    viewport={{ once: true, margin: "150px" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
              style={{ transformOrigin: "right" }}
              className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-[#d4af37] to-transparent"
            />
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map((d) => (
                <motion.span
                  key={d}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "150px" }}
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
                    viewport={{ once: true, margin: "150px" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
              style={{ transformOrigin: "left" }}
              className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#d4af37] to-transparent"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.2 }}
          className="mb-0 text-6xl font-serif text-[#d4af37] font-light drop-shadow-lg"
        >
          Yogi Digital Studio
        </motion.h1>
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.3 }}
          className="mt-4 mb-12 block"
        >
          <span className="text-[#d4af37] opacity-80 tracking-[0.4em] text-xs uppercase">
            Since 2001
          </span>
        </motion.div>
        <motion.p
          initial={{ y: 48, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "150px" }}
          transition={{ ease: "easeInOut", duration: 0.75, delay: 0.4 }}
          className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed px-2"
        >
          Where art meets emotion. We capture your most precious moments with elegant, cinematic, and timeless photography.{" "}
          Experience the opulent digital studio — crafting future memories through high-fashion wedding photography &amp; cinematic videography.
        </motion.p>
      </section>
    </div>
  );
};

export default SmoothScrollHero;
