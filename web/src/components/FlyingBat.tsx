import React, { useEffect, useState } from 'react';

interface FlyingBatProps {
  active: boolean;
  onComplete?: () => void;
}

export const FlyingBat: React.FC<FlyingBatProps> = ({ active, onComplete }) => {
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    if (active) {
      setFlying(true);
      const timer = setTimeout(() => {
        setFlying(false);
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!flying) return null;

  return (
    <div className="fixed inset-x-0 top-16 pointer-events-none z-50 overflow-hidden h-40">
      <div
        className="absolute flex items-center gap-2 animate-bat-flight"
        style={{
          animation: 'batFlight 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        }}
      >
        {/* Bat SVG with Flapping Wings */}
        <svg
          viewBox="0 0 64 36"
          className="w-16 h-10 text-pumpkin drop-shadow-[0_0_12px_rgba(255,122,0,0.6)]"
        >
          {/* Left Wing */}
          <path
            d="M 32 18 Q 20 2 6 12 Q 14 24 22 20 Q 28 26 32 18 Z"
            fill="#FF7A00"
            className="animate-wing-flap origin-right"
          />
          {/* Right Wing */}
          <path
            d="M 32 18 Q 44 2 58 12 Q 50 24 42 20 Q 36 26 32 18 Z"
            fill="#FF7A00"
            className="animate-wing-flap origin-left"
          />
          {/* Bat Head & Body */}
          <ellipse cx="32" cy="18" rx="4" ry="7" fill="#08070D" stroke="#C6A15B" strokeWidth="1" />
          <circle cx="30.5" cy="15" r="0.8" fill="#FF1389" />
          <circle cx="33.5" cy="15" r="0.8" fill="#FF1389" />
          {/* Small Ears */}
          <polygon points="29,13 31,8 32,13" fill="#C6A15B" />
          <polygon points="32,13 33,8 35,13" fill="#C6A15B" />
        </svg>

        {/* Trail of stardust */}
        <div className="flex gap-1.5 opacity-80">
          <span className="text-toxic text-xs animate-ping">✦</span>
          <span className="text-witchy text-[10px] animate-ping" style={{ animationDelay: '150ms' }}>✧</span>
          <span className="text-magenta text-xs animate-ping" style={{ animationDelay: '300ms' }}>★</span>
        </div>
      </div>

      <style>{`
        @keyframes batFlight {
          0% {
            transform: translate(-100px, 30px) rotate(-10deg) scale(0.7);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translate(50vw, -10px) rotate(5deg) scale(1.1);
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(110vw, 40px) rotate(-8deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
