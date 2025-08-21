import { motion, SVGMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedSVGProps extends SVGMotionProps<SVGSVGElement> {
  children: React.ReactNode;
  className?: string;
  decorative?: boolean;
  title?: string;
}

export function AnimatedSVG({ 
  children, 
  className = '', 
  decorative = false,
  title,
  ...props 
}: AnimatedSVGProps) {
  const prefersReducedMotion = useReducedMotion();

  const motionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
    ...props
  };

  return (
    <motion.svg
      className={className}
      aria-hidden={decorative}
      {...motionProps}
    >
      {title && <title>{title}</title>}
      {children}
    </motion.svg>
  );
}

// Checkmark animation for success states
export function CheckmarkSVG({ className = '', size = 24 }: { className?: string; size?: number }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <AnimatedSVG 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      title="Success"
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: "easeInOut"
        }}
      />
    </AnimatedSVG>
  );
}

// Progress circle for loading states
export function ProgressCircle({ 
  progress, 
  size = 40, 
  className = '' 
}: { 
  progress: number; 
  size?: number; 
  className?: string; 
}) {
  const prefersReducedMotion = useReducedMotion();
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatedSVG 
      width={size} 
      height={size} 
      className={className}
      decorative
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={2}
        fill="transparent"
        className="opacity-20"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={2}
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: "easeOut"
        }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </AnimatedSVG>
  );
}