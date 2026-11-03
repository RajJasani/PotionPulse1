import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-black uppercase tracking-wider text-purple-200/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-potionPurple animate-pulse" />
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-2xl border-2 border-purple-500/25 bg-[#140D22]/90 px-4 py-2.5 text-sm text-white placeholder:text-mutedText/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus:border-potionPurple focus:outline-none focus:ring-4 focus:ring-potionPurple/25 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 font-medium',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-bold flex items-center gap-1">⚠️ {error}</p>}
        {helperText && !error && <p className="text-xs text-mutedText font-medium">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
