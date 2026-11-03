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
      cardBg: 'bg-[#FFFBEB] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#FEE214] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#FEE214] text-slate-950 border border-slate-950',
    },
    lime: {
      cardBg: 'bg-[#ECFDF5] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#A2F708] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#A2F708] text-slate-950 border border-slate-950',
    },
    amber: {
      cardBg: 'bg-[#FFF7ED] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#FF7A00] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#FF7A00] text-slate-950 border border-slate-950',
    },
    magenta: {
      cardBg: 'bg-[#FFF1F2] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#FC4AAA] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#FC4AAA] text-slate-950 border border-slate-950',
    },
    violet: {
      cardBg: 'bg-[#FAF5FF] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#C77DFF] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#C77DFF] text-slate-950 border border-slate-950',
    },
    tropical: {
      cardBg: 'bg-[#ECFEFF] border-[2.5px] border-slate-950 shadow-[4px_4px_0px_0px_#0F0E17] hover:shadow-[6px_6px_0px_0px_#0F0E17]',
      iconBg: 'bg-[#1CBDF4] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]',
      accentColor: 'text-slate-950 font-black',
      badgeBg: 'bg-[#1CBDF4] text-slate-950 border border-slate-950',
    },
  };

  const style = variantStyles[variant] || variantStyles.brass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative p-5 rounded-3xl transition-all duration-200 group cursor-default select-none ${style.cardBg} ${className}`}
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
