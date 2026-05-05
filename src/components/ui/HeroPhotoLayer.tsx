'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface HeroPhotoLayerProps {
  url: string;
  isLoaded: boolean;
  opacity?: number;
}

export function HeroPhotoLayer({ url, isLoaded, opacity = 0.35 }: HeroPhotoLayerProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? opacity : 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--cosmic-bg) 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, var(--cosmic-bg), transparent 25%, transparent 75%, var(--cosmic-bg))' }}
      />
    </motion.div>
  );
}
