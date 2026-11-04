'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  href?: string;
  className?: string;
}

export function PotionPulseIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dimensions = {
    sm: { box: 'w-8 h-8', svg: 24, stroke: 2 },
    md: { box: 'w-11 h-11', svg: 32, stroke: 2.2 },
    lg: { box: 'w-14 h-14', svg: 42, stroke: 2.5 },
  }[size];

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-[#FF5C00] via-[#FF2E93] to-[#6320EE] border-2 border-ink shadow-retro flex items-center justify-center select-none group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-retro-lg transition-all duration-150 ${dimensions.box} ${className}`}
    >
      {/* Decorative cartoon gloss shine on corner */}
      <span className="absolute top-1 left-1 w-2 h-1 bg-white/70 rounded-full rotate-[-30deg] pointer-events-none" />

      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Alchemical magical liquid gradient */}
          <linearGradient id="potionLiquid" x1="6" y1="14" x2="30" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#06D6A0" />
            <stop offset="100%" stopColor="#FFBE1A" />
          </linearGradient>

          {/* Cork stopper wood gradient */}
          <linearGradient id="corkWood" x1="14" y1="3" x2="22" y2="9" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFBE1A" />
            <stop offset="100%" stopColor="#E59B00" />
          </linearGradient>
        </defs>

        {/* Cork Stopper with retro cartoon outline */}
        <path
          d="M14 6 C14 4.5 15 3.5 18 3.5 C21 3.5 22 4.5 22 6 L21 9 L15 9 Z"
          fill="url(#corkWood)"
          stroke="#1A1523"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Flask Rim */}
        <rect
          x="12"
          y="8"
          width="12"
          height="3.5"
          rx="1.5"
          fill="#FFFDF9"
          stroke="#1A1523"
          strokeWidth="2"
        />

        {/* Flask Glass Outline */}
        <path
          d="M14.5 11.5 L14.5 16 L7 28.5 C5.8 30.5 7.2 33 9.6 33 L26.4 33 C28.8 33 30.2 30.5 29 28.5 L21.5 16 L21.5 11.5"
          fill="#FFFDF9"
          stroke="#1A1523"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bubbling Potion Liquid Base */}
        <path
          d="M9.8 28 L12.5 23.5 C14.5 24.5 17 23 19 24 C21 25 23 23.5 26.2 28 C26.8 29 26.2 31 25 31 L11 31 C9.8 31 9.2 29 9.8 28 Z"
          fill="url(#potionLiquid)"
          stroke="#1A1523"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Heartbeat / Inventory Pulse Line Cutting Across Liquid */}
        <path
          d="M8.5 27.5 L13 27.5 L15 22 L17.5 30 L20 25.5 L22 27.5 L27.5 27.5"
          fill="none"
          stroke="#1A1523"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White inner glow highlight on pulse line */}
        <path
          d="M8.5 27.5 L13 27.5 L15 22 L17.5 30 L20 25.5 L22 27.5 L27.5 27.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Rising Alchemical Bubbles */}
        <circle cx="14" cy="18" r="1.5" fill="#00F0FF" stroke="#1A1523" strokeWidth="1" />
        <circle cx="21" cy="15" r="2" fill="#FFBE1A" stroke="#1A1523" strokeWidth="1" />
        <circle cx="16" cy="13" r="1" fill="#FFFFFF" stroke="#1A1523" strokeWidth="0.8" />

        {/* Celestial Star Sparkle */}
        <path
          d="M28 7 L29 10 L32 11 L29 12 L28 15 L27 12 L24 11 L27 10 Z"
          fill="#FFBE1A"
          stroke="#1A1523"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Logo({ size = 'md', iconOnly = false, href = '/', className = '' }: LogoProps) {
  const textStyles = {
    sm: {
      title: 'text-xl tracking-tight',
      tagline: 'text-[9px] tracking-wider',
    },
    md: {
      title: 'text-2xl sm:text-[26px] tracking-tight',
      tagline: 'text-[10px] tracking-widest',
    },
    lg: {
      title: 'text-3xl sm:text-4xl tracking-tight',
      tagline: 'text-xs tracking-widest',
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <PotionPulseIcon size={size} />

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black text-ink font-mono ${textStyles.title}`}>
              Potion<span className="text-[#FF5C00] inline-block -rotate-1 group-hover:rotate-0 transition-transform">Pulse</span>
            </span>
          </div>
          <span className={`font-mono font-black uppercase text-ink/70 mt-1 block ${textStyles.tagline}`}>
            Inventory Intelligence
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform active:scale-95">
        {content}
      </Link>
    );
  }

  return content;
}
