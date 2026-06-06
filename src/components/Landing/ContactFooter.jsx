import { MapPin, Phone, Mail, Camera, Video, Globe } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import GoldButton from '../ui/GoldButton';
import yogiLogo from '../../assets/yogi-logo.jpg';

export default function ContactFooter() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Main Footer Content */}
      <div className="px-6 md:px-12 lg:px-20 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand Column */}
          <ScrollReveal direction="up" delay={0}>
            <div>
              <img src={yogiLogo} alt="Yogi Digital Studio" className="w-36 mb-4" />
              <p className="text-silver/40 text-sm leading-relaxed max-w-xs">
                The opulent digital studio — capturing future memories with artistry and passion.
              </p>
            </div>
          </ScrollReveal>

          {/* Contact Column */}
          <ScrollReveal direction="up" delay={0.15}>
            <div>
              <p className="text-gold/80 text-[10px] tracking-[0.3em] uppercase mb-5">Contact</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold/60 mt-0.5 flex-shrink-0" />
                  <p className="text-silver/50 text-sm">#H96, Shop no.4, Periyar Nagar<br />Main Road, Erode - 1</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold/60 flex-shrink-0" />
                  <a href="tel:+919842775676" className="text-silver/50 text-sm hover:text-gold transition-colors">
                    +91 98 4277 5676
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold/60 flex-shrink-0" />
                  <a href="mailto:snapyogibalu@gmail.com" className="text-silver/50 text-sm hover:text-gold transition-colors">
                    snapyogibalu@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA Column */}
          <ScrollReveal direction="up" delay={0.3}>
            <div>
              <p className="text-gold/80 text-[10px] tracking-[0.3em] uppercase mb-5">Book a Session</p>
              <p className="text-silver/50 text-sm leading-relaxed mb-6">
                Ready to create timeless memories? Let&apos;s discuss your vision.
              </p>
              <GoldButton onClick={() => window.open('tel:+919842775676')}>
                Get in Touch
              </GoldButton>

              {/* Social Row */}
              <div className="flex items-center gap-3 mt-8">
                <a href="https://instagram.com/snapyogibalu" target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center hover:border-gold/30 hover:bg-gold/5 transition-all group"
                  title="Instagram">
                  <Camera className="w-3.5 h-3.5 text-silver/30 group-hover:text-gold transition-colors" />
                </a>
                <a href="https://facebook.com/snapyogibalu" target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center hover:border-gold/30 hover:bg-gold/5 transition-all group"
                  title="Facebook">
                  <Globe className="w-3.5 h-3.5 text-silver/30 group-hover:text-gold transition-colors" />
                </a>
                <a href="https://youtube.com/@snapyogibalu" target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center hover:border-gold/30 hover:bg-gold/5 transition-all group"
                  title="YouTube">
                  <Video className="w-3.5 h-3.5 text-silver/30 group-hover:text-gold transition-colors" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-silver/20 text-xs">
            © {new Date().getFullYear()} Yogi Digital Studio. All rights reserved.
          </p>
          <p className="text-silver/20 text-xs">
            Photography Executive — <span className="text-gold/40">Yogi Balu</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
