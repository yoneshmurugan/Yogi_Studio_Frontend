import { motion } from 'framer-motion';
import { Camera, Film, Users, Sparkles } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import GlassCard from '../ui/GlassCard';

const services = [
  {
    Icon: Camera,
    title: 'Wedding Photography',
    description: 'Cinematic moments captured with an editorial eye. Every emotion, every glance — preserved forever.',
  },
  {
    Icon: Film,
    title: 'Cinematic Videography',
    description: 'Film-grade wedding videos that feel like a feature. Drone aerials, slow motion, and storytelling edits.',
  },
  {
    Icon: Users,
    title: 'Portrait Sessions',
    description: 'Pre-wedding, maternity, couple & family portraits with studio or outdoor settings.',
  },
  {
    Icon: Sparkles,
    title: 'Event Coverage',
    description: 'Complete coverage for receptions, engagements, baby showers, and milestone celebrations.',
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function ServicesSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 max-w-7xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <p className="text-gold/80 text-xs tracking-[0.4em] uppercase mb-4">Our Services</p>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-white">
          What We Create
        </h2>
      </ScrollReveal>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {services.map((service) => (
          <motion.div key={service.title} variants={item}>
            <GlassCard className="h-full text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 mx-auto md:mx-0">
                <service.Icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-white font-medium text-base mb-2">{service.title}</h3>
              <p className="text-silver/50 text-sm leading-relaxed">{service.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
