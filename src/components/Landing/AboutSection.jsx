import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Phone, Camera, Video, Globe } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import yogiLogo from '../../assets/yogi-logo.jpg';

export default function AboutSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);

  return (
    <section ref={sectionRef} className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — Parallax Image */}
        <ScrollReveal direction="left">
          <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
            <motion.img
              src="https://picsum.photos/seed/studio-portrait/800/1000"
              alt="Studio portrait session"
              style={{ y: imgY }}
              className="w-full h-full object-cover scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
              <p className="text-gold text-xs tracking-[0.2em] uppercase mb-1">Est. Photography</p>
              <p className="text-white font-serif text-lg">The Opulent Digital Studio</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Right — Text reveals */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.1}>
            <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-2">About Us</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white leading-snug">
              Where Art Meets<br />
              <span className="italic gold-text">Emotion</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-silver/60 text-sm leading-relaxed">
              At Yogi Digital Studio, we don&apos;t just take photographs — we craft visual stories. 
              With years of experience in luxury wedding photography and cinematic videography, 
              our team brings an editorial eye and a heartfelt approach to every frame.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="text-silver/60 text-sm leading-relaxed">
              From intimate pre-wedding shoots to grand celebrations, 
              we capture the moments that matter most — with artistry, passion, and precision.
            </p>
          </ScrollReveal>

          {/* Studio Details */}
          <ScrollReveal delay={0.4}>
            <div className="border-t border-white/8 pt-6 mt-2 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-silver/50 text-sm">#H96, Shop no.4, Periyar Nagar Main Road, Erode - 1</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <p className="text-silver/50 text-sm">+91 98 4277 5676</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Social Links */}
          <ScrollReveal delay={0.5}>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://instagram.com/snapyogibalu" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="Instagram">
                <Camera className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <a href="https://facebook.com/snapyogibalu" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="Facebook">
                <Globe className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <a href="https://youtube.com/@snapyogibalu" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="YouTube">
                <Video className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <span className="text-silver/30 text-xs ml-2">@snapyogibalu</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
