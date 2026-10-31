export const colors = {
  ink: {
    deep: '#08070D',      // Main canvas background
    surface: '#0F0E17',   // Primary card background
    elevated: '#171524',  // Modals, sheets, elevated surfaces
    subtle: '#1F1B30',    // Interactive press/hover
    border: '#2A253F',    // Dividers
  },
  brass: {
    DEFAULT: '#C6A15B',   // Antique alchemical brass
    light: '#E5C378',     // Highlight
    dark: '#7D5C22',
    border: 'rgba(198, 161, 91, 0.28)',
    glow: 'rgba(198, 161, 91, 0.35)',
  },
  amber: {
    DEFAULT: '#FF7A00',   // Pumpkin amber (warning)
    light: '#FFA64D',
    glow: 'rgba(255, 122, 0, 0.35)',
    surface: 'rgba(255, 122, 0, 0.12)',
  },
  lime: {
    DEFAULT: '#2EFFA3',   // Toxic lime (healthy)
    light: '#70FFC0',
    glow: 'rgba(46, 255, 163, 0.35)',
    surface: 'rgba(46, 255, 163, 0.12)',
  },
  toxic: {
    DEFAULT: '#2EFFA3',   // Toxic lime alias
    light: '#70FFC0',
    glow: 'rgba(46, 255, 163, 0.35)',
    surface: 'rgba(46, 255, 163, 0.12)',
  },
  violet: {
    DEFAULT: '#9D4EDD',   // Witchy violet (arcane)
    light: '#C77DFF',
    glow: 'rgba(157, 78, 221, 0.40)',
    surface: 'rgba(157, 78, 221, 0.14)',
  },
  witchy: {
    DEFAULT: '#9D4EDD',   // Alias for violet
    light: '#C77DFF',
    glow: 'rgba(157, 78, 221, 0.40)',
    surface: 'rgba(157, 78, 221, 0.14)',
  },
  magenta: {
    DEFAULT: '#FF1389',   // Candy magenta (critical/curse)
    light: '#FF66B2',
    glow: 'rgba(255, 19, 137, 0.45)',
    surface: 'rgba(255, 19, 137, 0.14)',
  },
  cream: {
    DEFAULT: '#FAF6EE',   // Moonlight cream (primary text)
    muted: '#B8AF9F',     // Secondary text
    faint: '#6E6659',     // Tertiary
  }
} as const;

export const theme = {
  colors: {
    background: colors.ink.deep,
    surface: colors.ink.surface,
    surfaceElevated: colors.ink.elevated,
    border: colors.brass.border,
    text: colors.cream.DEFAULT,
    textMuted: colors.cream.muted,
    primary: colors.witchy.DEFAULT,
    success: colors.toxic.DEFAULT,
    warning: colors.amber.DEFAULT,
    danger: colors.magenta.DEFAULT,
    brass: colors.brass.DEFAULT,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 18,
    full: 9999,
  }
};
