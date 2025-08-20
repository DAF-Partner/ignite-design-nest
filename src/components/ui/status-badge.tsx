// Professional Status Badge Component
// Consistent status indicators across the debt collection platform

import React from 'react';
import { cn } from '@/lib/utils';
import { CaseStatus, ApprovalState } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: CaseStatus | ApprovalState | string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const statusConfig = {
  // Case Status Colors
  new: {
    label: 'New',
    className: 'status-new',
    variant: 'default' as const,
  },
  in_progress: {
    label: 'In Progress',
    className: 'status-in-progress',
    variant: 'default' as const,
  },
  awaiting_approval: {
    label: 'Awaiting Approval',
    className: 'status-awaiting-approval',
    variant: 'default' as const,
  },
  legal_stage: {
    label: 'Legal Stage',
    className: 'status-legal-stage',
    variant: 'default' as const,
  },
  closed: {
    label: 'Closed',
    className: 'status-closed',
    variant: 'default' as const,
  },
  
  // Approval Status Colors
  pending: {
    label: 'Pending',
    className: 'status-awaiting-approval',
    variant: 'default' as const,
  },
  approved: {
    label: 'Approved',
    className: 'status-closed',
    variant: 'default' as const,
  },
  rejected: {
    label: 'Rejected',
    className: 'status-legal-stage',
    variant: 'default' as const,
  },
  
  // Invoice Status Colors
  draft: {
    label: 'Draft',
    className: 'status-new',
    variant: 'outline' as const,
  },
  sent: {
    label: 'Sent',
    className: 'status-in-progress',
    variant: 'default' as const,
  },
  paid: {
    label: 'Paid',
    className: 'status-closed',
    variant: 'default' as const,
  },
  overdue: {
    label: 'Overdue',
    className: 'status-legal-stage',
    variant: 'default' as const,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground border-muted-dark',
    variant: 'outline' as const,
  },
};

export function StatusBadge({ 
  status, 
  variant, 
  size = 'default', 
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-muted-dark',
    variant: 'outline' as const,
  };

  const displayVariant = variant || config.variant;

  return (
    <Badge 
      variant={displayVariant}
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        'font-medium border',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

// Helper component for priority indicators
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      className: 'bg-success/10 text-success-foreground border-success/20',
    },
    medium: {
      label: 'Medium',
      className: 'bg-info/10 text-info-foreground border-info/20',
    },
    high: {
      label: 'High',
      className: 'bg-warning/10 text-warning-foreground border-warning/20',
    },
    urgent: {
      label: 'Urgent',
      className: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge 
      variant="outline"
      className={cn(
        config.className,
        'font-medium border text-xs',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}