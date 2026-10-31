import React, { useEffect, useState } from 'react';

interface SparkleItem {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  char: string;
}

interface ArcaneSparklesProps {
  active: boolean;
  onComplete?: () => void;
}

export const ArcaneSparkles: React.FC<ArcaneSparklesProps> = ({ active, onComplete }) => {
  const [sparkles, setSparkles] = useState<SparkleItem[]>([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const glyphs = ['✦', '★', '✧', '☽', '✺', '🜂', '🜄', '🜁'];
    const colors = ['#2EFFA3', '#C6A15B', '#E5C378', '#9D4EDD', '#FF1389', '#FAF6EE'];

    const items: SparkleItem[] = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * 2 * Math.PI;
      const distance = 40 + Math.random() * 120;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20,
        size: 10 + Math.random() * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.15,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
      };
    });

    setSparkles(items);
    const timer = setTimeout(() => {
      setSparkles([]);
      if (onComplete) onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || sparkles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute font-serif select-none animate-ping"
          style={{
            transform: `translate(${s.x}px, ${s.y}px)`,
            color: s.color,
            fontSize: `${s.size}px`,
            textShadow: `0 0 10px ${s.color}`,
            animationDuration: '0.9s',
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
};
