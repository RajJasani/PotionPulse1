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
      cardBg: 'bg-gradient-to-br from-white via-white to-[#FFFCEB] dark:from-[#1A1826] dark:via-[#161422] dark:to-[#12101C]',
      iconBg: 'bg-gradient-to-br from-[#FFF59D] via-[#FEE214] to-[#FF9F06] text-sig-black shadow-pro-glow-amber',
      accentColor: 'text-sig-black dark:text-[#FFE58F]',
      badgeBg: 'bg-gradient-to-r from-[#FFF59D] to-[#FEE214] text-sig-black',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
    lime: {
      cardBg: 'bg-gradient-to-br from-white via-white to-[#F2FDE4] dark:from-[#161E19] dark:via-[#131B16] dark:to-[#0F1612]',
      iconBg: 'bg-gradient-to-br from-[#C6FF66] via-[#A2F708] to-[#10B981] text-sig-black shadow-pro-glow-lime',
      accentColor: 'text-sig-black dark:text-[#B5FF2E]',
      badgeBg: 'bg-gradient-to-r from-sig-lima to-emerald-400 text-sig-black',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-white via-white to-[#FFF3E8] dark:from-[#211718] dark:via-[#1B1214] dark:to-[#140D0E]',
      iconBg: 'bg-gradient-to-br from-[#FFA033] via-[#FF7A00] to-[#E52E71] text-white shadow-pro-glow-amber',
      accentColor: 'text-sig-black dark:text-[#FFA033]',
      badgeBg: 'bg-gradient-to-r from-sig-naranja to-pink-500 text-white',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
    magenta: {
      cardBg: 'bg-gradient-to-br from-white via-white to-[#FDE8F5] dark:from-[#221323] dark:via-[#1C0E1D] dark:to-[#140916]',
      iconBg: 'bg-gradient-to-br from-[#FF7CBE] via-[#FC4AAA] to-[#9D4EDD] text-white shadow-pro-glow-pink',
      accentColor: 'text-sig-black dark:text-[#FF7CBE]',
      badgeBg: 'bg-gradient-to-r from-sig-cereza to-purple-600 text-white',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
    violet: {
      cardBg: 'bg-gradient-to-br from-white via-white to-[#F6EDFD] dark:from-[#1D142B] dark:via-[#170E24] dark:to-[#11091C]',
      iconBg: 'bg-gradient-to-br from-[#C77DFF] via-[#9D4EDD] to-[#5A189A] text-white shadow-pro-sm',
      accentColor: 'text-sig-black dark:text-[#C77DFF]',
      badgeBg: 'bg-gradient-to-r from-sig-violet to-indigo-600 text-white',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
    tropical: {
      cardBg: 'bg-gradient-to-br from-white via-white to-[#E8F9FE] dark:from-[#101C26] dark:via-[#0C1620] dark:to-[#081018]',
      iconBg: 'bg-gradient-to-br from-[#70E1F5] via-[#1CBDF4] to-[#3B82F6] text-white shadow-pro-glow-blue',
      accentColor: 'text-sig-black dark:text-[#38BDF8]',
      badgeBg: 'bg-gradient-to-r from-sig-tropical to-blue-500 text-white',
      glow: 'shadow-pro hover:shadow-pro-lg',
    },
  };

  const style = variantStyles[variant] || variantStyles.brass;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`relative p-5 rounded-3xl border border-black/10 dark:border-white/12 backdrop-blur-xl ${style.glow} ${style.cardBg} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <span className="font-sans text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {title}
          </span>
        </div>
        <div className={`p-2.5 rounded-2xl ${style.iconBg} border border-black/10 dark:border-white/10`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${style.accentColor}`}>
          {value}
        </span>
        {trend && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-black bg-rose-500 text-white uppercase shadow-sm animate-pulse">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
