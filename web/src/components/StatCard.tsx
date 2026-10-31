import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'lime' | 'amber' | 'magenta' | 'violet' | 'brass' | 'tropical';
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'brass',
  trend,
  className = '',
}) => {
  const variantStyles = {
    brass: {
      cardBg: 'bg-gradient-to-br from-[#2D1B06]/80 via-[#1C1226]/90 to-[#120B1C]/90 border border-amber-400/40 glow-amber-card',
      iconBg: 'bg-gradient-to-br from-[#FFE033] via-[#FFB800] to-[#FF8A00] text-black shadow-lg shadow-amber-500/40',
      accentColor: 'text-amber-300 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-amber-400/70',
    },
    lime: {
      cardBg: 'bg-gradient-to-br from-[#0D2E1C]/80 via-[#0E1F18]/90 to-[#0A1611]/90 border border-emerald-400/40 glow-emerald-card',
      iconBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-black shadow-lg shadow-emerald-500/40',
      accentColor: 'text-emerald-300 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-emerald-400/70',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-[#381605]/80 via-[#240E1B]/90 to-[#140810]/90 border border-orange-400/40 glow-amber-card',
      iconBg: 'bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 text-white shadow-lg shadow-orange-500/40',
      accentColor: 'text-orange-400 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-500 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-orange-400/70',
    },
    magenta: {
      cardBg: 'bg-gradient-to-br from-[#380E24]/80 via-[#220B1C]/90 to-[#140614]/90 border border-rose-400/40 glow-magenta-card',
      iconBg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-rose-500/40',
      accentColor: 'text-rose-400 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-rose-400/70',
    },
    violet: {
      cardBg: 'bg-gradient-to-br from-[#290E38]/80 via-[#1B0B2A]/90 to-[#11061D]/90 border border-purple-400/40 glow-violet-card',
      iconBg: 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/40',
      accentColor: 'text-purple-300 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-purple-400/70',
    },
    tropical: {
      cardBg: 'bg-gradient-to-br from-[#0A2238]/80 via-[#0B1728]/90 to-[#080E1C]/90 border border-cyan-400/40',
      iconBg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40',
      accentColor: 'text-cyan-300 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-cyan-400/70',
    },
  };

  const style = variantStyles[variant] || variantStyles.brass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative p-5 rounded-3xl backdrop-blur-2xl luxury-shimmer group cursor-default ${style.glow} ${style.cardBg} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <span className="font-sans text-[11px] font-black uppercase tracking-wider text-slate-300">
            {title}
          </span>
        </div>
        <div className={`p-2.5 rounded-2xl ${style.iconBg} border border-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${style.accentColor}`}>
          {value}
        </span>
        {trend && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-black bg-gradient-to-r from-rose-500 to-pink-600 text-white uppercase shadow-md shadow-rose-500/30 animate-pulse">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="font-sans text-xs font-medium text-slate-300/80 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
