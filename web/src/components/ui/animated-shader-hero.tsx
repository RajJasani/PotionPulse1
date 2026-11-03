import React, { useRef, useEffect, useState } from 'react';

export interface HeroProps {
  trustBadge?: {
    text?: string;
    icons?: string[];
    stickers?: Array<{
      text: string;
      icon?: string;
    }>;
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
  children?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<any[]>([]);

  // Interactive Cartoon Potion Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Bubble palette (Toxic Lime, Bubblegum Pink, Sun Yellow, Mana Cyan, Mystic Purple)
    const colors = [
      { r: 162, g: 247, b: 8 },   // Toxic Lime
      { r: 252, g: 74, b: 170 },  // Potion Pink
      { r: 254, g: 226, b: 20 },  // Star Yellow
      { r: 28, g: 189, b: 244 },  // Mana Cyan
      { r: 199, g: 125, b: 255 }, // Violet
      { r: 255, g: 122, b: 0 },   // Pumpkin
    ];

    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      color: { r: number; g: number; b: number };
      alpha: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 45;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 14 + 6,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.35,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.015,
      });
    }

    // Sparkles
    interface Sparkle {
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
    }
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 24; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 2,
        alpha: Math.random(),
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Mouse interactive bubble spawner
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (Math.random() < 0.35) {
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 20,
          y: mouseY + (Math.random() - 0.5) * 20,
          radius: Math.random() * 10 + 4,
          speedY: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.8,
          wobble: 0,
          wobbleSpeed: 0.05,
        });
        if (particles.length > maxParticles + 15) {
          particles.shift();
        }
      }
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Draw rich cartoon alchemical backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#240046');   // Deep Royal Purple
      bgGrad.addColorStop(0.45, '#3C096C'); // Mystic Violet
      bgGrad.addColorStop(0.85, '#5A189A'); // Rich Amethyst
      bgGrad.addColorStop(1, '#7B2CBF');   // Potion Plum
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial Cauldron Glow in Center Bottom
      const cauldronGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.9,
        10,
        width * 0.5,
        height * 0.9,
        width * 0.6
      );
      cauldronGlow.addColorStop(0, 'rgba(162, 247, 8, 0.40)');  // Lime toxic core
      cauldronGlow.addColorStop(0.35, 'rgba(254, 226, 20, 0.25)'); // Golden vapor
      cauldronGlow.addColorStop(0.7, 'rgba(252, 74, 170, 0.15)');  // Pink mist
      cauldronGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cauldronGlow;
      ctx.fillRect(0, 0, width, height);

      // Render Sparkles
      sparkles.forEach((s) => {
        s.alpha += s.pulseSpeed;
        const currentAlpha = (Math.sin(s.alpha) + 1) * 0.4 + 0.2;
        ctx.fillStyle = `rgba(255, 247, 0, ${currentAlpha})`;
        ctx.beginPath();
        // 4-point cartoon star
        const cx = s.x;
        const cy = s.y;
        const sz = s.size;
        ctx.moveTo(cx, cy - sz * 2);
        ctx.lineTo(cx + sz * 0.6, cy - sz * 0.6);
        ctx.lineTo(cx + sz * 2, cy);
        ctx.lineTo(cx + sz * 0.6, cy + sz * 0.6);
        ctx.lineTo(cx, cy + sz * 2);
        ctx.lineTo(cx - sz * 0.6, cy + sz * 0.6);
        ctx.lineTo(cx - sz * 2, cy);
        ctx.lineTo(cx - sz * 0.6, cy - sz * 0.6);
        ctx.closePath();
        ctx.fill();
      });

      // Render Rising Cartoon Potion Bubbles
      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.7 + p.speedX;

        // Wrap around
        if (p.y + p.radius < 0) {
          p.y = height + p.radius;
          p.x = Math.random() * width;
        }

        // Draw outer bubble with thick cartoon outline
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = `rgba(15, 14, 23, 0.85)`;
        ctx.stroke();

        // Cartoon crescent highlight inside the bubble
        ctx.beginPath();
        ctx.arc(
          p.x - p.radius * 0.3,
          p.y - p.radius * 0.3,
          p.radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha + 0.3})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const stickerStyles = [
    { bg: 'bg-[#FEE214]', text: 'text-slate-950', rotate: '-rotate-3' },
    { bg: 'bg-[#A2F708]', text: 'text-slate-950', rotate: 'rotate-2' },
    { bg: 'bg-[#1CBDF4]', text: 'text-slate-950', rotate: '-rotate-1' },
    { bg: 'bg-[#FC4AAA]', text: 'text-slate-950', rotate: 'rotate-3' },
    { bg: 'bg-[#FF7A00]', text: 'text-slate-950', rotate: '-rotate-2' },
  ];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Cartoon Canvas Backdrop */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover touch-none pointer-events-auto"
      />

      {/* Top Left Cartoon Shop Badge */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-6 z-20 hidden md:flex items-center gap-2 select-none pointer-events-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs bg-[#FFFDF7] text-slate-950 border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] -rotate-1">
          <span>🧙‍♀️</span>
          <span>MADAM HEXLEY'S GRIMOIRE</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs bg-[#A2F708] text-slate-950 border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] rotate-2">
          <span>🔮</span>
          <span>LIGHTGBM FORECASTER</span>
        </div>
      </div>

      {/* Top Right Cartoon Sticker Badges */}
      {trustBadge?.stickers && trustBadge.stickers.length > 0 && (
        <div className="absolute top-3.5 sm:top-5 right-3.5 sm:right-6 z-20 flex flex-wrap justify-end gap-2 max-w-[280px] sm:max-w-md pointer-events-auto select-none">
          {trustBadge.stickers.map((sticker, idx) => {
            const style = stickerStyles[idx % stickerStyles.length];
            return (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-wide border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] ${style.bg} ${style.text} ${style.rotate} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-150 cursor-default`}
              >
                {sticker.icon && <span className="text-sm">{sticker.icon}</span>}
                <span>{sticker.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content Stage */}
      {children ? (
        <div className="relative z-10 w-full h-full pointer-events-none">
          <div className="pointer-events-auto w-full h-full">{children}</div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20 pb-20 sm:pb-28 max-w-5xl mx-auto select-none pointer-events-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEE214] text-slate-950 border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] text-xs font-black uppercase tracking-wider mb-5 animate-bounce" style={{ animationDuration: '2.5s' }}>
            <span>⚡</span>
            <span>ALCHEMICAL INVENTORY INTELLIGENCE PLATFORM</span>
            <span>⚡</span>
          </div>

          {/* Chunky Cartoon Headings */}
          <div className="space-y-1 sm:space-y-2 mb-4">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#FFFDF7] drop-shadow-[4px_4px_0px_#0F0E17]">
              {headline.line1} <span className="inline-block animate-pulse">🧪</span>
            </h1>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#FEE214] drop-shadow-[4px_4px_0px_#0F0E17]">
              {headline.line2}
            </h2>
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-bold text-purple-100 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] leading-relaxed mb-8">
            {subtitle}
          </p>

          {/* High-Contrast Chunky Cartoon Action Buttons */}
          {buttons && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-lg mx-auto">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#FEE214] via-[#FFB800] to-[#FF7A00] text-slate-950 font-black text-base sm:text-lg border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17] hover:-translate-y-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#0F0E17] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl bg-[#A2F708] hover:bg-[#85D400] text-slate-950 font-black text-base sm:text-lg border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17] hover:-translate-y-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#0F0E17] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}

          {/* Quick Problem Statement Highlights Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-black">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]">
              <span>🌿</span> 15 Core Reagents Tracked
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFFBEB] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]">
              <span>🦇</span> Bat Wings: Stockout Sentinel
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF1F2] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]">
              <span>🌕</span> Midnight Curse: 3.0× Surge
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ECFEFF] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]">
              <span>🛡️</span> Zero Negative Inventory Guarantee
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
