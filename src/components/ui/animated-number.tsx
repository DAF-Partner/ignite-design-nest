import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ value, className = '', duration = 0.5 }: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const spring = useSpring(0, { 
    duration: prefersReducedMotion ? 0 : duration * 1000,
    bounce: 0 
  });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span 
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {display}
    </motion.span>
  );
}