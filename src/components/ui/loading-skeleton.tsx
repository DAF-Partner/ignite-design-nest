import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  variant?: 'card' | 'list' | 'table';
}

export function LoadingSkeleton({ 
  lines = 3, 
  className = '', 
  variant = 'card' 
}: LoadingSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  const skeletonVariants = {
    card: "space-y-3 p-4",
    list: "space-y-2",
    table: "space-y-4"
  };

  return (
    <motion.div 
      className={cn(skeletonVariants[variant], className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {variant === 'card' && (
        <>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </>
      )}
      
      {variant === 'list' && (
        Array.from({ length: lines }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: prefersReducedMotion ? 0 : i * 0.05,
              duration: prefersReducedMotion ? 0 : 0.2
            }}
            className="flex items-center space-x-3"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </motion.div>
        ))
      )}
      
      {variant === 'table' && (
        <>
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
          </div>
          {Array.from({ length: lines }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : i * 0.1,
                duration: prefersReducedMotion ? 0 : 0.15
              }}
              className="flex space-x-4"
            >
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/6" />
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}