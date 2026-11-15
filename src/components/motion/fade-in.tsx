'use client';

import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** animate on mount instead of when scrolled into view */
  immediate?: boolean;
}

export function FadeIn({ children, delay = 0, y = 18, className, immediate }: FadeInProps) {
  const animation = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(immediate ? { animate: animation } : { whileInView: animation, viewport: { once: true, margin: '-60px' } })}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
