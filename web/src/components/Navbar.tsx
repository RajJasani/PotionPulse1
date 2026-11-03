import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, Eye, AlertTriangle, Moon, FlaskConical, SunMedium, LogOut, ChevronDown } from 'lucide-react';
import { MoonPhaseIndicator } from './MoonPhaseIndicator';
import { useAuth } from '../context/AuthContext';

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
  const { user, openLogin, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b-2 border-slate-950 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors shadow-[0_4px_0px_0px_rgba(15,14,23,0.06)]">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name - Clean Single Line */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FEE214] border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] flex items-center justify-center group-hover:scale-105 group-hover:-rotate-6 transition-all flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-2xl font-black tracking-tight text-slate-950 leading-none whitespace-nowrap">
              Potion<span className="text-purple-600">Pulse</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#A2F708] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_#0F0E17]">
              v1.0 OS
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Cartoon Pill Capsule */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-[#FAF5FF] p-1 rounded-full border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0F0E17] flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative h-9 flex items-center gap-1.5 px-3 xl:px-3.5 2xl:px-4 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-purple-100/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navTabActivePill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-[#FEE214] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0F0E17] -z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-700'}`} />
                  <span className="hidden 2xl:inline">{tab.label}</span>
                  <span className="2xl:hidden">{tab.shortLabel}</span>

                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#FF5A51] text-white border border-slate-950 shadow-[1px_1px_0px_#0F0E17] animate-pulse ml-0.5">
                      {tab.badge}
                    </span>
                  )}

                  {tab.pulse && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] border border-slate-950 animate-ping ml-0.5 flex-shrink-0" />
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Moon Phase, Theme Switcher, Auth & Dispense Button */}
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

          {/* User Profile or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-9 flex items-center gap-1.5 px-3 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs font-black text-black transition-all flex-shrink-0"
                title={`${user.username} (${user.role})`}
              >
                <span className="text-base leading-none">{user.avatar_emoji || '🧙‍♀️'}</span>
                <span className="hidden sm:inline font-black text-xs text-black max-w-[110px] truncate">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-black" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 p-3 bg-[#FFFDF7] border-2 border-black rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] z-50 text-black text-left animate-fade-in-down">
                  <div className="pb-2.5 mb-2 border-b-2 border-black/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl p-1 bg-amber-100 rounded-xl border border-black/30">
                        {user.avatar_emoji || '🧙‍♀️'}
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-display font-black text-xs text-black truncate">
                          {user.username}
                        </p>
                        <p className="text-[10px] text-neutral-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-black text-rose-700 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-2 border border-transparent hover:border-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of Grimoire</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLogin}
              className="h-9 flex items-center gap-1.5 px-3.5 rounded-full bg-[#FEE214] hover:bg-[#E0C700] text-slate-950 border-2 border-slate-950 font-sans font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F0E17] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              <span className="text-sm">🔮</span>
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Sale Cartoon Pill Button */}
          <button
            onClick={() => onTabChange('inventory')}
            className="h-9 flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full bg-[#A2F708] hover:bg-[#85D400] text-slate-950 border-2 border-slate-950 font-sans font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F0E17] hover:shadow-[3px_3px_0px_0px_#0F0E17] hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
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
              className={`flex-shrink-0 h-8 flex items-center gap-1.5 px-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                isActive
                  ? 'bg-[#FEE214] text-slate-950 shadow-[2px_2px_0px_0px_#0F0E17]'
                  : 'bg-white text-slate-900 shadow-sm'
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
