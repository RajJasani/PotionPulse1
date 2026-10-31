import React, { useMemo } from 'react';

/**
 * Calculates current real-world Moon phase based on synodic month (29.53058867 days).
 * Known reference new moon: January 6, 2000, 18:14 UTC.
 */
export const getMoonPhaseInfo = (date: Date = new Date()) => {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const diffDays = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867;
  const phaseNormalized = (diffDays % synodicMonth + synodicMonth) % synodicMonth; // 0 to 29.53
  const age = phaseNormalized;
  const illumination = Math.round(((1 - Math.cos((age / synodicMonth) * 2 * Math.PI)) / 2) * 100);

  let phaseName = 'New Moon';
  let hexleyWisdom = 'The night is pitch black. Best time for clandestine reagent procurement.';

  if (age < 1.84) {
    phaseName = 'New Moon';
    hexleyWisdom = 'The unseen moon shields our pantry from witch hunters.';
  } else if (age < 5.53) {
    phaseName = 'Waxing Crescent';
    hexleyWisdom = 'Sprouting roots and Mandrakes take vigor from the silver sliver.';
  } else if (age < 9.22) {
    phaseName = 'First Quarter';
    hexleyWisdom = 'Equilibrium in the heavens. Ideal time to rebalance your shelves.';
  } else if (age < 12.91) {
    phaseName = 'Waxing Gibbous';
    hexleyWisdom = 'The lunar tide gathers potency. Prepare for the Full Moon Festival!';
  } else if (age < 16.61) {
    phaseName = 'Full Moon';
    hexleyWisdom = 'The Midnight Curse is at peak power! Reagent demand surges 3.0x.';
  } else if (age < 20.30) {
    phaseName = 'Waning Gibbous';
    hexleyWisdom = 'Residual celestial energies linger in kraken ink and dragon scales.';
  } else if (age < 23.99) {
    phaseName = 'Last Quarter';
    hexleyWisdom = 'Audit the stocks! Count what was sold before the next cycle begins.';
  } else if (age < 27.68) {
    phaseName = 'Waning Crescent';
    hexleyWisdom = 'The veil recedes. Restock safety buffers while prices sleep.';
  } else {
    phaseName = 'New Moon';
    hexleyWisdom = 'Darkness renews. Madam Hexley stokes the embers.';
  }

  return {
    age: Math.round(age * 10) / 10,
    illumination,
    phaseName,
    hexleyWisdom,
  };
};

export const MoonPhaseIndicator: React.FC = () => {
  const moonInfo = useMemo(() => getMoonPhaseInfo(), []);

  return (
    <div className="relative group cursor-pointer select-none">
      {/* Single-line sleek compact pill */}
      <div className="h-9 flex items-center gap-1.5 bg-slate-100 dark:bg-[#181428] px-3 rounded-full border border-slate-300 dark:border-white/15 text-xs shadow-sm hover:border-amber-400 transition-all duration-200">
        {/* Moon Disc SVG */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0">
          <circle cx="12" cy="12" r="9.5" fill="#0D0B14" stroke="#F59E0B" strokeWidth="1.5" />
          <path
            d="M 12 2.5 A 9.5 9.5 0 0 1 12 21.5 A 6.5 9.5 0 0 0 12 2.5"
            fill="#FDE68A"
            opacity={Math.max(0.4, moonInfo.illumination / 100)}
          />
        </svg>

        <span className="font-sans font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap flex items-center gap-1">
          <span className="hidden 2xl:inline">{moonInfo.phaseName}</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-300 font-mono font-black">
            {moonInfo.illumination}%
          </span>
        </span>
      </div>

      {/* Ephemeris Tooltip on Hover */}
      <div className="absolute right-0 top-full mt-2 w-64 p-3.5 bg-slate-900/95 dark:bg-[#181428]/98 backdrop-blur-md border border-amber-400/40 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 text-left">
        <div className="flex items-center gap-2 mb-1.5 border-b border-amber-400/20 pb-1.5">
          <span className="text-xs">🔮</span>
          <p className="font-display font-bold text-xs text-amber-300">{moonInfo.phaseName} ({moonInfo.illumination}%)</p>
        </div>
        <p className="font-sans text-[11px] text-slate-100 leading-relaxed italic">
          "{moonInfo.hexleyWisdom}"
        </p>
        <p className="mt-2 text-[10px] font-mono text-amber-200/60">
          Day {moonInfo.age} of synodic cycle (29.5d)
        </p>
      </div>
    </div>
  );
};
