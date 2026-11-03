import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#110C1D',
        darkSurface: '#191129',
        midnightPlum: '#241638',
        cardSurface: '#1E1430',
        potionPurple: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          deep: '#6D28D9',
        },
        violetGlow: '#C084FC',
        cauldronGreen: {
          DEFAULT: '#10B981',
          bright: '#00F59B',
          dark: '#059669',
        },
        emberOrange: {
          DEFAULT: '#F97316',
          bright: '#FF7700',
          dark: '#C2410C',
        },
        pumpkin: '#FB923C',
        magicPink: {
          DEFAULT: '#EC4899',
          bright: '#FF2E93',
          dark: '#BE185D',
        },
        arcaneCyan: {
          DEFAULT: '#06B6D4',
          bright: '#00D2FF',
          dark: '#0E7490',
        },
        goblinGold: {
          DEFAULT: '#F59E0B',
          bright: '#FBBF24',
          dark: '#B45309',
        },
        paleLavender: '#F4F0FA',
        cloudWhite: '#FFFFFF',
        successGreen: '#10B981',
        warningAmber: '#F59E0B',
        dangerRed: '#EF4444',
        mutedText: '#948AA5',
      },
      boxShadow: {
        'cartoon-purple': '0 4px 0 0 #5B21B6',
        'cartoon-purple-sm': '0 2px 0 0 #5B21B6',
        'cartoon-orange': '0 4px 0 0 #9A3412',
        'cartoon-green': '0 4px 0 0 #065F46',
        'cartoon-pink': '0 4px 0 0 #9D174D',
        'cartoon-cyan': '0 4px 0 0 #155E75',
        'cartoon-dark': '0 5px 0 0 #0A0614',
        'cartoon-card': '0 8px 0 0 #120A20, 0 16px 32px rgba(139, 92, 246, 0.15)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.45)',
        'glow-green': '0 0 25px rgba(0, 245, 155, 0.4)',
        'glow-orange': '0 0 25px rgba(249, 115, 22, 0.45)',
      },
      animation: {
        'bubble-float': 'bubbleFloat 4s ease-in-out infinite',
        'wiggle-slow': 'wiggle 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        bubbleFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
