import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'orange' | 'pink' | 'cyan' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white border-2 border-white/20 shadow-[0_2px_0_0_#1A102B]',
    success: 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 shadow-[0_2px_0_0_#065F46]',
    warning: 'bg-amber-500/20 text-amber-300 border-2 border-amber-400/50 shadow-[0_2px_0_0_#92400E]',
    danger: 'bg-rose-500/20 text-rose-300 border-2 border-rose-400/50 shadow-[0_2px_0_0_#991B1B]',
    purple: 'bg-purple-500/20 text-purple-200 border-2 border-purple-400/60 shadow-[0_2px_0_0_#5B21B6]',
    orange: 'bg-orange-500/20 text-orange-200 border-2 border-orange-400/60 shadow-[0_2px_0_0_#9A3412]',
    pink: 'bg-pink-500/20 text-pink-200 border-2 border-pink-400/60 shadow-[0_2px_0_0_#9D174D]',
    cyan: 'bg-cyan-500/20 text-cyan-200 border-2 border-cyan-400/60 shadow-[0_2px_0_0_#155E75]',
    outline: 'border-2 border-white/20 text-paleLavender bg-white/5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-tight select-none transition-transform hover:scale-105',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
