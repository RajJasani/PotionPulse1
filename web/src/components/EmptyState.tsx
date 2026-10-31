import React from 'react';
import { Sparkles, Package, AlertCircle, Moon } from 'lucide-react';

interface EmptyStateProps {
  type: 'inventory' | 'anomalies' | 'prophecy' | 'events';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const configs = {
    inventory: {
      icon: Package,
      defaultTitle: 'The Shelves are Bare!',
      defaultDesc: 'Even the familiars are looking bored. Not a single reagent in sight. Brew up a new ingredient to stock Madam Hexley\'s pantry.',
      iconColor: 'text-amber',
      accentGlow: 'shadow-glow-amber',
    },
    anomalies: {
      icon: AlertCircle,
      defaultTitle: 'The Wards Hold Strong',
      defaultDesc: 'No spectral theft, sudden drain, or rogue goblin consumption detected. All reagents are safe in their flasks.',
      iconColor: 'text-toxic',
      accentGlow: 'shadow-glow-lime',
    },
    prophecy: {
      icon: Sparkles,
      defaultTitle: 'The Scrying Pool is Clear',
      defaultDesc: 'No impending stockouts on the horizon. All reagents are comfortably buffered against demand.',
      iconColor: 'text-witchy',
      accentGlow: 'shadow-glow-violet',
    },
    events: {
      icon: Moon,
      defaultTitle: 'The Heavens are Asleep',
      defaultDesc: 'No active festivals or curses decreed. The moon watches in silence awaiting your command.',
      iconColor: 'text-brass-light',
      accentGlow: 'shadow-glow-brass',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-brass/20 rounded-2xl bg-ink-surface/50 backdrop-blur-sm">
      <div className={`w-14 h-14 rounded-2xl bg-ink-elevated border border-brass/30 flex items-center justify-center ${config.accentGlow} mb-4`}>
        <Icon className={`w-7 h-7 ${config.iconColor}`} />
      </div>

      <h3 className="font-display text-xl font-semibold text-moonlight">
        {title || config.defaultTitle}
      </h3>

      <p className="mt-2 font-sans text-sm text-moonlight-muted max-w-md leading-relaxed">
        {description || config.defaultDesc}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brass to-brass-dark text-ink-deep font-sans font-semibold text-xs tracking-wider uppercase shadow-glow-brass hover:brightness-110 active:scale-95 transition-all min-h-[44px]"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
