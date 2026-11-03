import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'orange' | 'pink' | 'cyan' | 'amber' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-sand text-ink border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    success: 'bg-[#06D6A0] text-ink border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    warning: 'bg-[#FFBE1A] text-ink border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    danger: 'bg-[#E63946] text-white border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    purple: 'bg-[#6320EE] text-white border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    orange: 'bg-[#FF5C00] text-white border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    amber: 'bg-[#FFBE1A] text-ink border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    pink: 'bg-[#FF2E93] text-white border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    cyan: 'bg-[#00B4D8] text-ink border-2 border-ink shadow-[2px_2px_0px_#1A1523]',
    outline: 'border-2 border-ink text-ink bg-white shadow-[2px_2px_0px_#1A1523]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider select-none transition-transform',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
