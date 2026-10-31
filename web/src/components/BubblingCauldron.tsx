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
    <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative" style={{ width: w, height: h }}>
        {/* Steam wisps */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-70">
          <div className="w-1 h-3 rounded-full bg-toxic/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-4 rounded-full bg-witchy/60 animate-bounce" style={{ animationDelay: '200ms' }} />
          <div className="w-1 h-3 rounded-full bg-pumpkin/60 animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>

        {/* Cauldron SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(46,255,163,0.35)]"
        >
          <defs>
            <linearGradient id="cauldronBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F1B30" />
              <stop offset="50%" stopColor="#0F0E17" />
              <stop offset="100%" stopColor="#08070D" />
            </linearGradient>
            <linearGradient id="potionBrew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2EFFA3" />
              <stop offset="50%" stopColor="#9D4EDD" />
              <stop offset="100%" stopColor="#FF1389" />
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
          <path d="M 28 82 Q 22 92 18 94 Q 28 92 34 82" fill="#C6A15B" opacity="0.8" />
          <path d="M 72 82 Q 78 92 82 94 Q 72 92 66 82" fill="#C6A15B" opacity="0.8" />

          {/* Belly */}
          <ellipse cx="50" cy="62" rx="36" ry="26" fill="url(#cauldronBody)" stroke="#C6A15B" strokeWidth="1.5" />
          {/* Rim */}
          <ellipse cx="50" cy="38" rx="34" ry="7" fill="#171524" stroke="#C6A15B" strokeWidth="2" />

          {/* Liquid brew */}
          <ellipse cx="50" cy="39" rx="30" ry="5.5" fill="url(#potionBrew)" filter="url(#cauldronGlow)" />

          {/* Rising bubbles */}
          <circle cx="42" cy="38" r="2.5" fill="#2EFFA3" className="animate-ping" style={{ animationDuration: '1.4s' }} />
          <circle cx="56" cy="37" r="2" fill="#FF1389" className="animate-ping" style={{ animationDuration: '1.8s', animationDelay: '300ms' }} />
          <circle cx="50" cy="39" r="1.8" fill="#FAF6EE" className="animate-ping" style={{ animationDuration: '1.2s', animationDelay: '600ms' }} />

          {/* Brass rivets & emblem */}
          <circle cx="50" cy="64" r="3.5" fill="#C6A15B" stroke="#E5C378" strokeWidth="1" />
          <path d="M 50 58 L 50 70 M 44 64 L 56 64" stroke="#08070D" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {caption && (
        <p className="mt-3 font-display italic text-sm text-moonlight-muted max-w-xs leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
};
