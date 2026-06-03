'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export function MotionSection({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay } },
      }}
    >
      {children}
    </motion.section>
  );
}

export const MotionDiv = motion.div;

// Richer motion helpers for interactive UI
export const buttonMotion = {
  whileHover: { scale: 1.04, y: -3, boxShadow: '0px 10px 30px rgba(2,6,23,0.08)' },
  whileTap: { scale: 0.98, y: 0 },
  transition: { type: 'spring', stiffness: 600, damping: 22 },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  hover: { y: -8, boxShadow: '0 12px 30px rgba(2,6,23,0.08)', transition: { type: 'spring', stiffness: 320 } },
};

export const MotionButton = motion.button;
export const MotionCard = motion.div;
