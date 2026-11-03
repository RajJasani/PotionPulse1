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
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-hackOrange" />
              {label}
            </span>
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border-2 border-ink bg-white px-3.5 py-2 text-sm font-semibold text-ink placeholder:text-mutedText/60 shadow-retro-sm transition-all duration-100 focus:border-hackOrange focus:shadow-[4px_4px_0px_#FF5C00] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-hackRed focus:border-hackRed focus:shadow-[4px_4px_0px_#E63946]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-hackRed font-mono font-bold flex items-center gap-1">❌ {error}</p>}
        {helperText && !error && <p className="text-xs text-mutedText font-medium">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
