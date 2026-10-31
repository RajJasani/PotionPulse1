export const palette = {
  ink: {
    deep: '#08070D',      // Abyssal background (not pure black)
    surface: '#0F0E17',   // Primary card background
    elevated: '#171524',  // Elevated panels, dialogs, drawers
    subtle: '#1F1B30',    // Interactive surface hover
    border: '#2A253F',    // Structural borders
  },
  brass: {
    DEFAULT: '#C6A15B',   // Antique alchemical brass
    light: '#E5C378',     // Polished brass highlight
    dark: '#7D5C22',      // Deep engraved shadow
    border: 'rgba(198, 161, 91, 0.28)',
    glow: 'rgba(198, 161, 91, 0.35)',
  },
  amber: {
    DEFAULT: '#FF7A00',   // Pumpkin Amber (warning, impending runout)
    light: '#FFA64D',
    glow: 'rgba(255, 122, 0, 0.35)',
    surface: 'rgba(255, 122, 0, 0.12)',
  },
  lime: {
    DEFAULT: '#2EFFA3',   // Toxic / Arcane Lime (healthy stock, success, prophecy verified)
    light: '#70FFC0',
    glow: 'rgba(46, 255, 163, 0.35)',
    surface: 'rgba(46, 255, 163, 0.12)',
  },
  violet: {
    DEFAULT: '#9D4EDD',   // Witchy Violet (restock spell, arcane actions)
    light: '#C77DFF',
    dark: '#5A189A',
    glow: 'rgba(157, 78, 221, 0.40)',
    surface: 'rgba(157, 78, 221, 0.14)',
  },
  magenta: {
    DEFAULT: '#FF1389',   // Candy Magenta (critical stockout, Midnight Curse, high anomaly)
    light: '#FF66B2',
    glow: 'rgba(255, 19, 137, 0.45)',
    surface: 'rgba(255, 19, 137, 0.14)',
  },
  cream: {
    DEFAULT: '#FAF6EE',   // Moonlight Cream (headings & high contrast text)
    muted: '#B8AF9F',     // Secondary UI text
    faint: '#6E6659',     // Inactive labels, dates, unit tags
  }
} as const;

export const semanticTokens = {
  background: {
    canvas: palette.ink.deep,
    surface: palette.ink.surface,
    elevated: palette.ink.elevated,
    hover: palette.ink.subtle,
  },
  text: {
    primary: palette.cream.DEFAULT,
    secondary: palette.cream.muted,
    faint: palette.cream.faint,
    accentBrass: palette.brass.light,
  },
  status: {
    healthy: palette.lime.DEFAULT,
    warning: palette.amber.DEFAULT,
    critical: palette.magenta.DEFAULT,
    arcane: palette.violet.DEFAULT,
  },
  border: {
    default: palette.ink.border,
    brass: palette.brass.border,
    brassBright: palette.brass.DEFAULT,
  },
  glow: {
    brass: `0 0 16px ${palette.brass.glow}`,
    lime: `0 0 18px ${palette.lime.glow}`,
    amber: `0 0 18px ${palette.amber.glow}`,
    magenta: `0 0 20px ${palette.magenta.glow}`,
    violet: `0 0 18px ${palette.violet.glow}`,
  }
} as const;

export const typography = {
  fontFamily: {
    display: ['Fraunces', 'Georgia', 'serif'],
    sans: ['Space Grotesk', 'Sora', 'sans-serif'],
    mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
    '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.035em' }],
  }
} as const;
