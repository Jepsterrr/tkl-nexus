'use client';

import { motion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_STANDARD } from '@/lib/motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_STANDARD },
  },
};

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerReveal({ children, className, delay = 0 }: StaggerRevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={{
          ...containerVariants,
          visible: {
            ...containerVariants.visible,
            transition: {
              ...containerVariants.visible.transition,
              delayChildren: delay,
            },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
