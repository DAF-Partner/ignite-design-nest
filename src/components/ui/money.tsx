// Professional Money Formatting Component
// Consistent currency display across the debt collection platform

import React from 'react';
import { cn } from '@/lib/utils';

interface MoneyProps {
  value?: number;
  amount?: number;
  currency: string;
  className?: string;
  showSign?: boolean;
  precision?: number;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'danger' | 'muted';
}

const sizeClasses = {
  sm: 'text-sm',
  default: 'text-base',
  lg: 'text-lg font-medium',
  xl: 'text-xl font-semibold',
};

const variantClasses = {
  default: 'text-foreground',
  success: 'text-success',
  danger: 'text-destructive',
  muted: 'text-muted-foreground',
};

export function Money({
  value,
  amount,
  currency,
  className,
  showSign = false,
  precision = 2,
  size = 'default',
  variant = 'default',
}: MoneyProps) {
  const finalAmount = value ?? amount ?? 0;
  const formatCurrency = (value: number, currencyCode: string) => {
    // Handle different currency formats
    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    try {
      // Use European locale for professional formatting
      return new Intl.NumberFormat('en-GB', formatOptions).format(value);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${currencyCode} ${value.toFixed(precision)}`;
    }
  };

  const formattedAmount = formatCurrency(Math.abs(finalAmount), currency);
  const isNegative = finalAmount < 0;
  const isPositive = finalAmount > 0;
  
  // Determine the sign to show
  let sign = '';
  if (showSign && isPositive) {
    sign = '+';
  } else if (isNegative) {
    sign = '-';
  }

  // Auto-adjust variant based on amount if not explicitly set
  let finalVariant = variant;
  if (variant === 'default') {
    if (isNegative) {
      finalVariant = 'danger';
    } else if (showSign && isPositive) {
      finalVariant = 'success';
    }
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        sizeClasses[size],
        variantClasses[finalVariant],
        className
      )}
      title={`${sign}${formattedAmount}`}
    >
      {sign}{formattedAmount}
    </span>
  );
}

// Helper component for amount differences
interface AmountDifferenceProps {
  originalAmount: number;
  currentAmount: number;
  currency: string;
  className?: string;
}

export function AmountDifference({
  originalAmount,
  currentAmount,
  currency,
  className,
}: AmountDifferenceProps) {
  const difference = currentAmount - originalAmount;
  const percentage = originalAmount !== 0 ? (difference / originalAmount) * 100 : 0;

  if (difference === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Money
        amount={difference}
        currency={currency}
        showSign
        size="sm"
      />
      <span className="text-muted-foreground">
        ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
      </span>
    </div>
  );
}

// Component for displaying amount ranges
interface AmountRangeProps {
  minAmount: number;
  maxAmount: number;
  currency: string;
  className?: string;
}

export function AmountRange({
  minAmount,
  maxAmount,
  currency,
  className,
}: AmountRangeProps) {
  return (
    <span className={cn('font-mono', className)}>
      <Money amount={minAmount} currency={currency} size="sm" /> 
      {' - '}
      <Money amount={maxAmount} currency={currency} size="sm" />
    </span>
  );
}