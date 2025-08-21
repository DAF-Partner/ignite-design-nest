import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export const animatedToast = {
  success: (options: Omit<ToastOptions, 'type'>) => {
    const Icon = toastIcons.success;
    toast.success(options.title, {
      description: options.description,
      duration: options.duration || 3000,
      icon: <Icon className="h-4 w-4 text-green-500" />,
    });
  },
  
  error: (options: Omit<ToastOptions, 'type'>) => {
    const Icon = toastIcons.error;
    toast.error(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <Icon className="h-4 w-4 text-red-500" />,
    });
  },
  
  warning: (options: Omit<ToastOptions, 'type'>) => {
    const Icon = toastIcons.warning;
    toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 3500,
      icon: <Icon className="h-4 w-4 text-yellow-500" />,
    });
  },
  
  info: (options: Omit<ToastOptions, 'type'>) => {
    const Icon = toastIcons.info;
    toast.info(options.title, {
      description: options.description,
      duration: options.duration || 3000,
      icon: <Icon className="h-4 w-4 text-blue-500" />,
    });
  },
};