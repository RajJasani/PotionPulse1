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
      cardBg: 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/70 to-white border border-amber-300/80 shadow-lg shadow-amber-500/10 glow-amber-card',
      iconBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30',
      accentColor: 'text-amber-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-amber-400/90',
    },
    lime: {
      cardBg: 'bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5]/70 to-white border border-emerald-300/80 shadow-lg shadow-emerald-500/10 glow-emerald-card',
      iconBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/30',
      accentColor: 'text-emerald-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-emerald-400/90',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5]/70 to-white border border-orange-300/80 shadow-lg shadow-orange-500/10 glow-amber-card',
      iconBg: 'bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 text-white shadow-md shadow-orange-500/30',
      accentColor: 'text-orange-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-500 text-black',
      glow: 'shadow-xl hover:shadow-2xl hover:border-orange-400/90',
    },
    magenta: {
      cardBg: 'bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6]/70 to-white border border-rose-300/80 shadow-lg shadow-rose-500/10 glow-magenta-card',
      iconBg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white shadow-md shadow-rose-500/30',
      accentColor: 'text-rose-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-rose-400/90',
    },
    violet: {
      cardBg: 'bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF]/70 to-white border border-purple-300/80 shadow-lg shadow-purple-500/10 glow-violet-card',
      iconBg: 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30',
      accentColor: 'text-purple-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-purple-400/90',
    },
    tropical: {
      cardBg: 'bg-gradient-to-br from-[#ECFEFF] via-[#CFFAFE]/70 to-white border border-cyan-300/80 shadow-lg shadow-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-md shadow-cyan-500/30',
      accentColor: 'text-cyan-950 font-black drop-shadow-sm',
      badgeBg: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
      glow: 'shadow-xl hover:shadow-2xl hover:border-cyan-400/90',
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
          <span className="font-sans text-[11px] font-black uppercase tracking-wider text-slate-700">
            {title}
          </span>
        </div>
        <div className={`p-2.5 rounded-2xl ${style.iconBg} border border-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
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
        <p className="font-sans text-xs font-semibold text-slate-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
