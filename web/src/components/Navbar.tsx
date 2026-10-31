import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, Eye, AlertTriangle, Moon, FlaskConical, SunMedium } from 'lucide-react';
import { MoonPhaseIndicator } from './MoonPhaseIndicator';

export type NavTab = 'dashboard' | 'inventory' | 'crystal-ball' | 'anomalies' | 'events';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unresolvedAnomaliesCount?: number;
  hasActiveEvent?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  unresolvedAnomaliesCount = 0,
  hasActiveEvent = true,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Cauldron View', shortLabel: 'Cauldron', icon: Sparkles },
    { id: 'inventory' as NavTab, label: 'The Shelves', shortLabel: 'Shelves', icon: Package },
    { id: 'crystal-ball' as NavTab, label: 'Crystal Ball', shortLabel: 'Crystal Ball', icon: Eye },
    {
      id: 'anomalies' as NavTab,
      label: 'Strange Happenings',
      shortLabel: 'Anomalies',
      icon: AlertTriangle,
      badge: unresolvedAnomaliesCount > 0 ? unresolvedAnomaliesCount : undefined,
    },
    {
      id: 'events' as NavTab,
      label: 'Midnight Curse',
      shortLabel: 'Midnight Curse',
      icon: Moon,
      pulse: hasActiveEvent,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-2xl border-b border-amber-300/70 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name - Clean Single Line */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 border border-amber-300/60 shadow-md shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 group-hover:rotate-[-3deg] transition-all flex-shrink-0">
            <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none whitespace-nowrap">
              Potion<span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Pulse</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs - High Contrast Single-Line Capsule */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-amber-100/70 backdrop-blur-md p-1 rounded-full border border-amber-200/80 shadow-inner flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative h-9 flex items-center gap-1.5 px-3 xl:px-3.5 2xl:px-4 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-amber-200/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navTabActivePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 border border-amber-500/40 shadow-md -z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-700'}`} />
                  <span className="hidden 2xl:inline">{tab.label}</span>
                  <span className="2xl:hidden">{tab.shortLabel}</span>

                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white shadow-sm animate-pulse ml-0.5">
                      {tab.badge}
                    </span>
                  )}

                  {tab.pulse && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping ml-0.5 flex-shrink-0" />
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Moon Phase, Theme Switcher & Dispense Button - Clean Single Line */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <div className="flex items-center flex-shrink-0">
            <MoonPhaseIndicator />
          </div>

          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? "Switch to Sunny Cream Mode" : "Switch to Nocturnal Midnight Mode"}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-amber-100/80 border border-amber-300/80 shadow-sm hover:scale-105 active:scale-95 transition-all text-amber-950 flex-shrink-0"
            >
              {isDarkMode ? (
                <SunMedium className="w-4 h-4 text-amber-600" />
              ) : (
                <Moon className="w-4 h-4 text-amber-950" />
              )}
            </button>
          )}

          {/* Quick Sale Gradient Pill Button */}
          <button
            onClick={() => onTabChange('inventory')}
            className="h-9 flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-500 text-slate-950 border border-amber-500/40 font-sans font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap flex-shrink-0"
          >
            <span>+ Dispense Sale</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="lg:hidden flex items-center justify-between gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 h-8 flex items-center gap-1.5 px-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-500/40 shadow-sm'
                  : 'bg-amber-50/80 text-slate-800 border-amber-200'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
