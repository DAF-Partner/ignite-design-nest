import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}

export function AnimatedList({ 
  children, 
  className = '', 
  stagger = true 
}: AnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || !stagger) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className = '' }: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerItem}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      layout
    >
      {children}
    </motion.div>
  );
}