import React from 'react';
import { Sparkles, Moon, Zap, ShieldAlert, Heart } from 'lucide-react';

interface SiglitosTickerProps {
  unresolvedCount?: number;
  hasActiveEvent?: boolean;
}

export const SiglitosTicker: React.FC<SiglitosTickerProps> = ({
  unresolvedCount = 0,
  hasActiveEvent = true,
}) => {
  const items = [
    { text: "POTIONPULSE ✦ SMART INVENTORY ENGINE", icon: Sparkles },
    { text: "PREDICTIVE DEMAND PROPHECIES & SMART RESTOCK", icon: Zap },
    { text: "100% ARTISANAL POTION FLASH • NO ARTIFICIAL SPIRITS", icon: Heart },
    { text: hasActiveEvent ? "⚡ MIDNIGHT CURSE ACTIVE: 3.0X SURGE FORECAST" : "MOON CYCLE: NORMAL TIDES", icon: Moon },
    { text: unresolvedCount > 0 ? `🚨 ${unresolvedCount} STRANGE HAPPENINGS FLAGGED` : "ALL SHELVES STABLE", icon: ShieldAlert },
    { text: "HISTOGRAM GRADIENT BOOSTING REGRESSOR (18.4% WAPE)", icon: Sparkles },
    { text: "FRESH BATCHES CONSECRATED DAILY", icon: Zap },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FFF7ED] border-b border-amber-300/80 py-2.5 overflow-hidden select-none relative z-40 shadow-sm">
      <div className="animate-ticker font-sans font-black text-xs sm:text-[12px] tracking-widest uppercase flex items-center">
        {/* Set 1 */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`set1-${idx}`} className="flex items-center gap-2.5 px-6 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5 text-amber-600 fill-amber-500 flex-shrink-0 animate-pulse" />
              <span className="text-amber-950 font-black tracking-wider">
                {item.text}
              </span>
              <span className="text-amber-500 font-black text-sm ml-2">✦</span>
            </div>
          );
        })}
        {/* Set 2 (Identical mirror for infinite seamless translation) */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`set2-${idx}`} className="flex items-center gap-2.5 px-6 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5 text-amber-600 fill-amber-500 flex-shrink-0 animate-pulse" />
              <span className="text-amber-950 font-black tracking-wider">
                {item.text}
              </span>
              <span className="text-amber-500 font-black text-sm ml-2">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
