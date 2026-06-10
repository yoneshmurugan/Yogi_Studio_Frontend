import { Star } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "P K Deepak",
      role: "Local Guide",
      avatar: "https://ui-avatars.com/api/?name=P+K+Deepak&background=d4af37&color=fff",
      text: "Excellent studio once you visit you can see the difference on photo how they strong in their filed."
    },
    {
      name: "Uma Sivam",
      role: "4 reviews",
      avatar: "https://ui-avatars.com/api/?name=Uma+Sivam&background=1a1a1a&color=d4af37",
      text: "my daughter half sarry function excellent photos & videos, reels ,Thanks Yogibalu mappilai."
    },
    {
      name: "Bharathi Shankar",
      role: "4 reviews",
      avatar: "https://ui-avatars.com/api/?name=Bharathi+Shankar&background=1a1a1a&color=d4af37",
      text: "Dedicated professionals...Good coordination Pakka output... Highly recommended studio..."
    },
    {
      name: "Saravanan Vb",
      role: "5 reviews",
      avatar: "https://ui-avatars.com/api/?name=Saravanan+Vb&background=1a1a1a&color=d4af37",
      text: "It's a professional studio, best in erode and never miss this kind of photographer. Yogi Balu good photographer."
    }
  ];

  return (
    <section id="testimonials" className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 w-full flex flex-col items-center">
      <ScrollReveal className="text-center w-full max-w-4xl mx-auto mb-16">
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Testimonials</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-white leading-tight mb-6">
          Cherished by <span className="italic gold-text">Families</span>
        </h2>
        <p className="text-base sm:text-lg text-silver/60 max-w-2xl mx-auto mb-8">
          Our passion lies in immortalizing your most precious milestones. Hear from the families who trusted us to capture their timeless stories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://share.google/JW8D58ccwmDwbmkir" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full bg-gold text-black uppercase tracking-[0.15em] text-xs font-medium hover:bg-gold/90 hover:scale-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Write a Google Review
          </a>
          <a 
            href="https://share.google/JW8D58ccwmDwbmkir" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full border border-gold/40 text-gold uppercase tracking-[0.15em] text-xs font-medium hover:bg-gold/10 hover:border-gold/60 transition-all cursor-pointer"
          >
            Read more on Google
          </a>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
        {/* Left Large Card */}
        <ScrollReveal delay={0.1} className="h-full">
          <div className="bg-charcoal/40 p-8 md:p-10 rounded-2xl flex flex-col justify-between border border-white/5 backdrop-blur-md shadow-2xl h-full group hover:border-gold/20 transition-all duration-500">
            <div className="mb-12">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-silver/90 font-light leading-relaxed italic">
                "{reviews[0].text}"
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img src={reviews[0].avatar} alt={reviews[0].name} className="w-14 h-14 rounded-full border border-gold/20 object-cover" />
              <div>
                <p className="font-serif text-white tracking-wide">{reviews[0].name}</p>
                <p className="text-sm text-gold/60 uppercase tracking-widest text-[10px] mt-1">{reviews[0].role}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Top Right Card */}
          <ScrollReveal delay={0.2} className="flex-1">
            <div className="bg-charcoal/40 p-8 rounded-2xl flex flex-col justify-between border border-white/5 backdrop-blur-md shadow-xl h-full group hover:border-gold/20 transition-all duration-500">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-base md:text-lg text-silver/80 font-light leading-relaxed mb-8 italic">
                "{reviews[1].text}"
              </p>
              <div className="flex items-center gap-4">
                <img src={reviews[1].avatar} alt={reviews[1].name} className="w-12 h-12 rounded-full border border-gold/20 object-cover" />
                <div>
                  <p className="font-serif text-white tracking-wide text-sm">{reviews[1].name}</p>
                  <p className="text-[10px] text-gold/60 uppercase tracking-widest mt-0.5">{reviews[1].role}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Right Row (2 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.slice(2).map((review, idx) => (
              <ScrollReveal key={review.name} delay={0.3 + (idx * 0.1)} className="h-full">
                <div className="bg-charcoal/40 p-6 rounded-2xl flex flex-col justify-between border border-white/5 backdrop-blur-md shadow-lg h-full group hover:border-gold/20 transition-all duration-500">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-silver/70 font-light leading-relaxed mb-6 italic">
                    "{review.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full border border-gold/20 object-cover" />
                    <div>
                      <p className="font-serif text-white tracking-wide text-xs">{review.name}</p>
                      <p className="text-[9px] text-gold/60 uppercase tracking-widest mt-0.5">{review.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
