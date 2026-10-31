import React from 'react';
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0E0C16]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name - Clean Single Line */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#FFF59D] via-[#FEE214] to-[#FF9F06] border border-amber-500/40 shadow-sm flex items-center justify-center group-hover:scale-105 group-hover:rotate-[-3deg] transition-all flex-shrink-0">
            <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
              Potion<span className="text-amber-500 dark:text-amber-400">Pulse</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs - High Contrast Single-Line Capsule */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100 dark:bg-[#181428] backdrop-blur-md p-1 rounded-full border border-slate-300 dark:border-white/15 shadow-inner flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative h-9 flex items-center gap-1.5 px-3 xl:px-3.5 2xl:px-4 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] text-black shadow-md border border-amber-500/40 scale-[1.02]'
                    : 'text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-amber-300 hover:bg-slate-200/90 dark:hover:bg-white/15'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-slate-700 dark:text-slate-200'}`} />
                <span className="hidden 2xl:inline">{tab.label}</span>
                <span className="2xl:hidden">{tab.shortLabel}</span>

                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white shadow-sm animate-pulse ml-0.5">
                    {tab.badge}
                  </span>
                )}

                {tab.pulse && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5 flex-shrink-0" />
                )}
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
              className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#181428] border border-slate-300 dark:border-white/15 shadow-sm hover:scale-105 active:scale-95 transition-all text-slate-800 dark:text-amber-300 flex-shrink-0"
            >
              {isDarkMode ? (
                <SunMedium className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>
          )}

          {/* Quick Sale Gradient Pill Button */}
          <button
            onClick={() => onTabChange('inventory')}
            className="h-9 flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-[#FFD000] via-[#FFB800] to-[#FF9000] hover:from-[#FFE033] hover:to-[#FFA000] text-black border border-amber-500/40 font-sans font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap flex-shrink-0"
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
                  ? 'bg-gradient-to-r from-[#FFD000] to-[#FF9000] text-black border-amber-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#181428] text-slate-900 dark:text-slate-100 border-slate-300 dark:border-white/15'
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
