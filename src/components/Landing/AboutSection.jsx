import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Phone } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import yogiLogo from '../../assets/yogi-logo-removebg-preview.png';
import ImageSwiper from './ImageSwiper';

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
  </svg>
);

const WhatsappIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

// Placeholder images until you add your own
const aboutImg1 = 'src/assets/yogi_balu (1).png';
const aboutImg2 = 'src/assets/yogi_balu (4).jpg';
const aboutImg3 = 'src/assets/yogi_balu (2).jpg';
const aboutImg4 = '';
const aboutImg5 = '';

const ABOUT_CARDS = [
  { id: 1, imageUrl: aboutImg1 },
  { id: 2, imageUrl: aboutImg2 },
  { id: 3, imageUrl: aboutImg3 },
  { id: 4, imageUrl: aboutImg4 },
  { id: 5, imageUrl: aboutImg5 }
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Automatically calculate years of experience based on 1994
  const experienceYears = new Date().getFullYear() - 1994;

  const imgY = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);

  const [swiperDims, setSwiperDims] = useState({ width: 320, height: 420 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSwiperDims({ width: 320, height: 420 });
      } else if (window.innerWidth < 1024) {
        setSwiperDims({ width: 440, height: 580 });
      } else {
        setSwiperDims({ width: 540, height: 710 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="about" ref={sectionRef} className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <ScrollReveal direction="left">
          <div className="flex items-center justify-center w-full relative">
            <ImageSwiper cards={ABOUT_CARDS} cardWidth={swiperDims.width} cardHeight={swiperDims.height} />
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-auto whitespace-nowrap rounded-2xl px-6 py-4 shadow-2xl z-20 pointer-events-none text-center border border-white/10 bg-black/60 backdrop-blur-md">
              <p className="text-gold tracking-[0.2em] uppercase text-[9px] mb-0.5">Yogi Balu</p>
              <p className="text-white font-serif text-base mb-2">Yogi Digital Studio</p>
              <div className="inline-block px-2.5 py-0.5 rounded-full border border-gold/20 bg-gold/10">
                <p className="text-gold/90 text-[9px] tracking-widest">{experienceYears}+ YEARS EXPERIENCE</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right — Text reveals */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.1}>
            <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-2">About Us • Since 2001</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white leading-snug">
              Where Art Meets<br />
              <span className="italic gold-text">Emotion</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-silver/60 text-sm leading-relaxed">
              At Yogi Digital Studio, photography is more than a profession—it is a lifelong pursuit of cinematic perfection. We blend an editorial aesthetic with raw authenticity to craft films and photographs that transcend time.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="text-silver/60 text-sm leading-relaxed">
              For {experienceYears} years, we have been welcomed into your families and trusted with your most intimate moments. Our approach is incredibly personal—we don't just stand behind a camera; we celebrate with you, laugh with you, and quietly preserve the genuine emotion of your greatest milestones.
            </p>
          </ScrollReveal>

          {/* Studio Details */}
          <ScrollReveal delay={0.4}>
            <div className="border-t border-white/8 pt-6 mt-2 space-y-3">
              <a href="https://www.google.com/maps/search/?api=1&query=Periyar+Nagar+Main+Road,+Erode" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-silver/50 text-sm hover:text-gold transition-colors">#H96, Shop no.4, Periyar Nagar Main Road, Erode - 1</p>
              </a>
              <a href="https://wa.me/919842775676" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <p className="text-silver/50 text-sm hover:text-gold transition-colors">+91 98427 75676</p>
              </a>
            </div>
          </ScrollReveal>

          {/* Social Links */}
          <ScrollReveal delay={0.5}>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://www.instagram.com/yogistudio_official?igsh=NXFlM3RpOG82M2R0" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="Instagram">
                <InstagramIcon className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <a href="https://wa.me/919842775676" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="WhatsApp">
                <WhatsappIcon className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <a href="https://youtube.com/@yogistudio-official?si=w81KIpSqR3SXeSWk" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all group"
                title="YouTube">
                <YoutubeIcon className="w-4 h-4 text-silver/40 group-hover:text-gold transition-colors" />
              </a>
              <span className="text-silver/30 text-xs ml-2">@yogistudio_official</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
