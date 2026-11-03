import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'orange' | 'pink';
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
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'orange' | 'pink';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
} = {}) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 via-potionPurple to-purple-600 text-white font-bold border-2 border-violet-300/40 shadow-cartoon-purple hover:shadow-cartoon-purple-sm hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    secondary:
      'bg-[#2A1C44] text-paleLavender font-bold border-2 border-purple-400/30 shadow-[0_4px_0_0_#140B22] hover:bg-[#342354] hover:border-purple-300/60 hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    success:
      'bg-gradient-to-r from-emerald-500 via-teal-500 to-cauldronGreen text-slate-950 font-extrabold border-2 border-emerald-200/60 shadow-cartoon-green hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    orange:
      'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold border-2 border-amber-200/50 shadow-cartoon-orange hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    pink:
      'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white font-extrabold border-2 border-pink-200/50 shadow-cartoon-pink hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    outline:
      'border-2 border-purple-400/40 bg-purple-950/30 text-purple-200 font-bold hover:bg-purple-900/40 hover:border-purple-300 hover:text-white shadow-[0_4px_0_0_#160A26] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold border-2 border-red-300/40 shadow-[0_4px_0_0_#991B1B] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-100',
    ghost:
      'bg-transparent text-paleLavender hover:bg-white/10 hover:text-white font-bold transition-all duration-150',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4.5 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl font-extrabold gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-3xl font-black gap-3',
  };

  return cn(
    'inline-flex items-center justify-center font-bold tracking-tight select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-potionPurple disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
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
