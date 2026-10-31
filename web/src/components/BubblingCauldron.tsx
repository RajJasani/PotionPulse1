import React from 'react';

interface BubblingCauldronProps {
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
}

export const BubblingCauldron: React.FC<BubblingCauldronProps> = ({
  size = 'md',
  caption = 'Stirring the cauldron & consulting the stars...',
}) => {
  const sizeMap = {
    sm: { w: 48, h: 48 },
    md: { w: 80, h: 80 },
    lg: { w: 120, h: 120 },
  };

  const { w, h } = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className="relative" style={{ width: w, height: h }}>
        {/* Steam wisps rising */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-90 z-20 pointer-events-none">
          <div className="w-1.5 h-5 rounded-full bg-emerald-400/80 animate-bounce" style={{ animationDuration: '1.2s', animationDelay: '0ms' }} />
          <div className="w-2 h-6 rounded-full bg-purple-400/80 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '250ms' }} />
          <div className="w-1.5 h-4 rounded-full bg-amber-400/80 animate-bounce" style={{ animationDuration: '1.1s', animationDelay: '500ms' }} />
        </div>

        {/* Cauldron SVG with native animations */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(168,85,247,0.45)]"
        >
          <defs>
            <linearGradient id="cauldronBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A174D" />
              <stop offset="50%" stopColor="#1B0D33" />
              <stop offset="100%" stopColor="#100620" />
            </linearGradient>
            <linearGradient id="potionBrew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <filter id="cauldronGlow">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cauldron feet */}
          <path d="M 28 82 Q 22 92 18 94 Q 28 92 34 82" fill="#E5C378" opacity="0.9" />
          <path d="M 72 82 Q 78 92 82 94 Q 72 92 66 82" fill="#E5C378" opacity="0.9" />

          {/* Belly */}
          <ellipse cx="50" cy="62" rx="36" ry="26" fill="url(#cauldronBody)" stroke="#FFD000" strokeWidth="1.5" />
          {/* Rim */}
          <ellipse cx="50" cy="38" rx="34" ry="7" fill="#1C1033" stroke="#FFD000" strokeWidth="2" />

          {/* Liquid brew */}
          <ellipse cx="50" cy="39" rx="30" ry="5.5" fill="url(#potionBrew)" filter="url(#cauldronGlow)">
            <animate attributeName="rx" values="29;31;29" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* Rising bubbles with continuous native SVG animation */}
          <circle cx="42" cy="38" r="2.8" fill="#10B981">
            <animate attributeName="cy" values="44;32;24" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;3;4" dur="1.8s" repeatCount="indefinite" />
          </circle>

          <circle cx="58" cy="37" r="2.2" fill="#F43F5E">
            <animate attributeName="cy" values="43;30;22" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.2;2.5;3.5" dur="2.2s" begin="0.5s" repeatCount="indefinite" />
          </circle>

          <circle cx="50" cy="39" r="2.5" fill="#FFD000">
            <animate attributeName="cy" values="45;33;25" dur="1.5s" begin="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.9s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.8;3;4" dur="1.5s" begin="0.9s" repeatCount="indefinite" />
          </circle>

          {/* Brass rivets & emblem */}
          <circle cx="50" cy="64" r="3.5" fill="#FFD000" stroke="#FFF" strokeWidth="0.8" />
          <path d="M 50 58 L 50 70 M 44 64 L 56 64" stroke="#08070D" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {caption && (
        <p className="mt-2 font-mono text-[11px] font-bold text-amber-300/80 max-w-xs leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
};
