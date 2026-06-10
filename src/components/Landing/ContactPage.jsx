import React, { useEffect } from 'react';
import { RevealLinks } from './RevealLinks';
import ScrollReveal from '../ui/ScrollReveal';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 md:pt-36 bg-black min-h-screen text-white flex flex-col items-center">

      {/* Header Section */}
      <div className="text-center w-full max-w-4xl mx-auto px-4 mb-16">
        <ScrollReveal>
          <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Get In Touch</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light text-white leading-tight mb-6">
            Let's Create <span className="italic gold-text">Magic</span>
          </h1>
          <p className="text-base sm:text-lg text-silver/60 max-w-2xl mx-auto">
            We would love to hear from you. Whether it's a wedding, a special event, or a personal shoot, let's discuss how we can bring your vision to life.
          </p>
        </ScrollReveal>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">

        {/* Left Column: Socials & Contact Details */}
        <div className="flex flex-col justify-between space-y-16">
          <ScrollReveal delay={0.2}>
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-white mb-8 border-b border-white/10 pb-4">Connect With Us</h2>
              <RevealLinks />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="space-y-8 glass p-8 rounded-2xl border border-white/5">
              <a href="tel:+919842775676" className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-silver/60 text-xs tracking-[0.2em] uppercase mb-1">Call or WhatsApp</p>
                  <p className="text-lg text-white group-hover:text-gold transition-colors">+91 98427 75676</p>
                </div>
              </a>

              <a href="mailto:snapyogibalu@gmail.com" className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-silver/60 text-xs tracking-[0.2em] uppercase mb-1">Email Us</p>
                  <p className="text-lg text-white group-hover:text-gold transition-colors">snapyogibalu@gmail.com</p>
                </div>
              </a>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-silver/60 text-xs tracking-[0.2em] uppercase mb-1">Visit Studio</p>
                  <p className="text-lg text-white group-hover:text-gold transition-colors">Yogi Digital Studio, Erode, Tamil Nadu</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Google Map */}
        <ScrollReveal delay={0.4} className="h-full min-h-[500px] lg:min-h-full rounded-2xl overflow-hidden border border-white/10 glass">
          <iframe
            src="https://maps.google.com/maps?q=Yogi%20Studio%20Erode&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '500px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="filter grayscale-[0.8] contrast-[1.2] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          ></iframe>
        </ScrollReveal>
      </div>
    </div>
  );
}
