import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className = '', 
  showValue = false 
}: AnimatedProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      </div>
      {showValue && (
        <motion.div 
          className="absolute -top-6 right-0 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
}