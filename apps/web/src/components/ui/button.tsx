import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'orange' | 'pink' | 'purple' | 'amber' | 'mint';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  href?: string;
  as?: 'button' | 'span';
}

export const buttonVariants = ({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'orange' | 'pink' | 'purple' | 'amber' | 'mint';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
} = {}) => {
  const variants = {
    primary:
      'bg-[#FF5C00] text-white hover:bg-[#E55300] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    purple:
      'bg-[#6320EE] text-white hover:bg-[#5214D6] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    secondary:
      'bg-white text-ink hover:bg-[#FAF5EE] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-extrabold',
    success:
      'bg-[#06D6A0] text-ink hover:bg-[#05BF8E] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    mint:
      'bg-[#06D6A0] text-ink hover:bg-[#05BF8E] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    orange:
      'bg-[#FF5C00] text-white hover:bg-[#E55300] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    amber:
      'bg-[#FFBE1A] text-ink hover:bg-[#F0B010] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    pink:
      'bg-[#FF2E93] text-white hover:bg-[#E52080] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    outline:
      'border-2 border-ink bg-[#FAF5EE] text-ink hover:bg-[#EFE7D8] shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-extrabold',
    danger:
      'bg-[#E63946] text-white hover:bg-[#D02936] border-2 border-ink shadow-retro hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1A1523] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1A1523] font-black',
    ghost:
      'bg-transparent text-ink hover:bg-sand font-extrabold border-2 border-transparent hover:border-ink transition-all',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl font-black gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-2xl font-black gap-3',
  };

  return cn(
    'inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className,
  );
};

export const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      href,
      as,
      ...props
    },
    ref,
  ) => {
    const classes = buttonVariants({ variant, size, className });

    const spinner = isLoading ? (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : null;

    if (href) {
      return (
        <Link
          ref={ref}
          href={href}
          className={classes}
          {...(props as any)}
        >
          {spinner}
          {children}
        </Link>
      );
    }

    if (as === 'span') {
      return (
        <span
          ref={ref}
          className={classes}
          {...(props as any)}
        >
          {spinner}
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {spinner}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
