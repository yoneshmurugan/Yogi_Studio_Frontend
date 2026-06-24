import { motion } from 'framer-motion';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

const directions = {
  up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
};

// Mobile: shorter travel distance for snappier feel
const directionsMobile = {
  up: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  once = true,
  amount = 0.3,
}) {
  const mobile = isMobile();
  const variantSet = mobile ? directionsMobile : directions;
  const variants = variantSet[direction] || variantSet.up;
  const effectiveDuration = mobile ? Math.min(duration, 0.5) : duration;
  const effectiveAmount = mobile ? Math.min(amount, 0.15) : amount;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: effectiveAmount, margin: "150px" }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration: effectiveDuration,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
