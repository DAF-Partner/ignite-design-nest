// Motion configuration and variants for consistent animations
import { Variants } from 'framer-motion';

// Animation configuration
export const MOTION_CONFIG = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const, // cubic-bezier equivalent to Tailwind's ease-out
  reducedMotion: {
    duration: 0.01,
    ease: 'linear' as const,
  },
};

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Micro-interactions
export const buttonPress = {
  whileTap: { scale: 0.98 },
  whileHover: { scale: 1.02 },
};

export const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.15 } },
};

// List item stagger
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Counter animation
export const numberCounter = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.1, 1] },
  transition: { duration: 0.3 },
};

// Progress bar
export const progressBar: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 1 },
};

// Utility function to get motion config based on reduced motion preference
export const getMotionConfig = (prefersReducedMotion: boolean) => 
  prefersReducedMotion ? MOTION_CONFIG.reducedMotion : MOTION_CONFIG;