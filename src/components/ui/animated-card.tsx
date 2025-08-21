import { motion, HTMLMotionProps } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cardHover } from '@/lib/motion';

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hoverable = true,
  ...props 
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const motionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    ...(hoverable && cardHover),
    ...props
  };

  return (
    <motion.div {...motionProps}>
      <Card className={cn("transition-shadow", className)}>
        {children}
      </Card>
    </motion.div>
  );
}