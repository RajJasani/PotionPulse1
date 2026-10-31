import React, { useId, useEffect, useRef, useState } from 'react';

export interface PotionBottleGaugeProps {
  currentStock: number;
  maxCapacity?: number;
  unit?: string;
  minimumThreshold?: number;
  reorderPoint?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

/**
 * PotionBottleGauge: Custom hand-crafted SVG potion flask.
 * Fills with animated liquid, volumetric hash marks, rising bubbles,
 * adaptive alchemical luminescence, and physical "slosh" reaction on stock change.
 */
export const PotionBottleGauge: React.FC<PotionBottleGaugeProps> = ({
  currentStock,
  maxCapacity = 100,
  unit = 'g',
  minimumThreshold = 10,
  reorderPoint = 25,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const fillPercentage = Math.max(0, Math.min(100, (currentStock / maxCapacity) * 100));

  // Delightful Micro-Interaction: Bottle sloshes on stock change
  const prevStockRef = useRef(currentStock);
  const [isSloshing, setIsSloshing] = useState(false);

  useEffect(() => {
    if (prevStockRef.current !== currentStock) {
      setIsSloshing(true);
      const timer = setTimeout(() => setIsSloshing(false), 800);
      prevStockRef.current = currentStock;
      return () => clearTimeout(timer);
    }
  }, [currentStock]);

  // Determine alchemical color state
  let primaryColor = '#A2F708'; // Siglitos Lima (Healthy)
  let glowColor = 'rgba(162, 247, 8, 0.45)';
  let surfaceColor = 'rgba(162, 247, 8, 0.2)';
  let statusLabel = 'Healthy';

  if (currentStock <= 0) {
    primaryColor = '#8C867C'; // Depleted Ash
    glowColor = 'rgba(140, 134, 124, 0.2)';
    surfaceColor = 'rgba(140, 134, 124, 0.15)';
    statusLabel = 'Stocked Out';
  } else if (currentStock <= minimumThreshold) {
    primaryColor = '#FC4AAA'; // Siglitos Cereza Pink (Critical)
    glowColor = 'rgba(252, 74, 170, 0.55)';
    surfaceColor = 'rgba(252, 74, 170, 0.25)';
    statusLabel = 'Critical';
  } else if (currentStock <= reorderPoint) {
    primaryColor = '#FF7A00'; // Siglitos Naranja Orange (Warning)
    glowColor = 'rgba(255, 122, 0, 0.5)';
    surfaceColor = 'rgba(255, 122, 0, 0.22)';
    statusLabel = 'Low Stock';
  }

  // Dimensions based on size
  const sizeMap = {
    sm: { width: 56, height: 76, labelSize: 'text-xs' },
    md: { width: 84, height: 114, labelSize: 'text-sm' },
    lg: { width: 120, height: 160, labelSize: 'text-base' },
  };
  const dim = sizeMap[size];

  // Flask coordinates (ViewBox: 0 0 100 130)
  const reservoirTop = 50;
  const reservoirBottom = 118;
  const maxLiquidHeight = reservoirBottom - reservoirTop;
  const currentLiquidHeight = (fillPercentage / 100) * maxLiquidHeight;
  const liquidY = reservoirBottom - currentLiquidHeight;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div
        className={`relative group flex justify-center items-center transition-transform duration-300 ${
          isSloshing ? 'scale-105 rotate-2 animate-wiggle' : ''
        }`}
      >
        {/* Soft aura glow behind bottle */}
        <div
          className={`absolute -inset-2 rounded-full blur-xl transition-all duration-300 pointer-events-none ${
            isSloshing ? 'opacity-90 scale-110' : 'opacity-60 group-hover:opacity-90'
          }`}
          style={{ background: glowColor }}
        />

        <svg
          width={dim.width}
          height={dim.height}
          viewBox="0 0 100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 ease-out group-hover:scale-105"
        >
          <defs>
            {/* Liquid Clip Path following the flask interior curve */}
            <clipPath id={`flask-interior-${uniqueId}`}>
              <path d="M42 46H58V55C58 55 76 68 76 92C76 112 66 118 50 118C34 118 24 112 24 92C24 68 42 55 42 55V46Z" />
            </clipPath>

            {/* Glowing Liquid Gradient */}
            <linearGradient id={`liquid-grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.65" />
            </linearGradient>

            {/* Glass Surface Reflection */}
            <linearGradient id={`glass-glare-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Brass Cork Stopper Gradient */}
            <linearGradient id={`cork-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#84652A" />
              <stop offset="50%" stopColor="#E5C378" />
              <stop offset="100%" stopColor="#7D5C22" />
            </linearGradient>
          </defs>

          {/* CORK STOPPER WITH BRASS CAP */}
          <rect x="43" y="14" width="14" height="12" rx="2" fill={`url(#cork-grad-${uniqueId})`} />
          <path d="M41 24H59V28H41V24Z" fill="#C6A15B" stroke="#7D5C22" strokeWidth="0.8" />

          {/* INNER LIQUID (CLIPPED) */}
          <g clipPath={`url(#flask-interior-${uniqueId})`}>
            {/* Background tinted glass depth */}
            <rect x="20" y="46" width="60" height="74" fill={surfaceColor} />

            {/* Animated Liquid Reservoir */}
            <rect
              x="20"
              y={liquidY}
              width="60"
              height={currentLiquidHeight + 10}
              fill={`url(#liquid-grad-${uniqueId})`}
              className={`transition-all duration-700 ease-out ${isSloshing ? 'brightness-125' : ''}`}
            />

            {/* Undulating Meniscus Wave on Top */}
            {fillPercentage > 0 && (
              <path
                d={
                  isSloshing
                    ? `M20 ${liquidY} Q35 ${liquidY - 7} 50 ${liquidY + 4} T80 ${liquidY - 5} V${liquidY + 8} H20 Z`
                    : `M20 ${liquidY} Q35 ${liquidY - 3} 50 ${liquidY} T80 ${liquidY} V${liquidY + 4} H20 Z`
                }
                fill={primaryColor}
                opacity={isSloshing ? '0.95' : '0.8'}
                className="animate-liquid-wave transition-all duration-200"
              />
            )}

            {/* Arcane Bubbles Rising */}
            {fillPercentage > 15 && (
              <g className={isSloshing ? 'animate-bounce' : 'animate-bubble-float'}>
                <circle cx="44" cy={liquidY + 22} r="2.2" fill="#FAF6EE" opacity="0.65" />
                <circle cx="56" cy={liquidY + 12} r="1.6" fill="#FAF6EE" opacity="0.75" />
                <circle cx="48" cy={liquidY + 34} r="2.8" fill="#FAF6EE" opacity="0.5" />
              </g>
            )}
          </g>

          {/* VOLUMETRIC HASH MARKS (25%, 50%, 75%) */}
          <line x1="68" y1="101" x2="74" y2="101" stroke="#0E0E0E" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="66" y1="84" x2="74" y2="84" stroke="#0E0E0E" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="68" y1="67" x2="74" y2="67" stroke="#0E0E0E" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* OUTER GLASS FLASK CONTOUR WITH BOLD SIGLITOS INK OUTLINE */}
          <path
            d="M42 28H58V46C58 46 76 60 76 92C76 114 66 120 50 120C34 120 24 114 24 92C24 60 42 46 42 46V28Z"
            fill="none"
            stroke="#0E0E0E"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flask Lip Ring */}
          <ellipse cx="50" cy="28" rx="9" ry="2.5" fill="#FEE214" stroke="#0E0E0E" strokeWidth="1.8" />

          {/* Left Glass Curvature Glare Highlight */}
          <path
            d="M27 90C27 72 38 56 42 49V47C39 52 26 68 26 90C26 106 32 114 42 116C33 113 27 104 27 90Z"
            fill={`url(#glass-glare-${uniqueId})`}
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Numerical Badge & Unit */}
      {showLabels && (
        <div className="mt-2 text-center">
          <div className="font-mono text-xs font-black tracking-tight text-slate-900 dark:text-white">
            {currentStock.toFixed(1)}
            <span className="text-[10px] text-slate-500 dark:text-slate-300 ml-1 uppercase font-bold">{unit}</span>
          </div>
          <div
            className="text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5 border border-black/20 shadow-sm"
            style={{
              color: '#000000',
              backgroundColor: primaryColor,
            }}
          >
            {statusLabel}
          </div>
        </div>
      )}
    </div>
  );
};

