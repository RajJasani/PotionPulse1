/**
 * Tailwind Configuration Preset for "Madam Hexley's Potion Pantry"
 * Apothecary Meets Neon Laboratory Visual Identity
 */
import type { Config } from 'tailwindcss';

export const apothecaryPreset = {
  theme: {
    extend: {
      colors: {
        ink: {
          deep: '#08070D',
          surface: '#0F0E17',
          elevated: '#171524',
          subtle: '#1F1B30',
          border: '#2A253F',
        },
        brass: {
          DEFAULT: '#C6A15B',
          light: '#E5C378',
          dark: '#7D5C22',
          border: 'rgba(198, 161, 91, 0.28)',
          glow: 'rgba(198, 161, 91, 0.35)',
        },
        pumpkin: {
          DEFAULT: '#FF7A00',
          light: '#FFA64D',
          glow: 'rgba(255, 122, 0, 0.35)',
          surface: 'rgba(255, 122, 0, 0.12)',
        },
        toxic: {
          DEFAULT: '#2EFFA3',
          light: '#70FFC0',
          glow: 'rgba(46, 255, 163, 0.35)',
          surface: 'rgba(46, 255, 163, 0.12)',
        },
        witchy: {
          DEFAULT: '#9D4EDD',
          light: '#C77DFF',
          dark: '#5A189A',
          glow: 'rgba(157, 78, 221, 0.40)',
          surface: 'rgba(157, 78, 221, 0.14)',
        },
        magenta: {
          DEFAULT: '#FF1389',
          light: '#FF66B2',
          glow: 'rgba(255, 19, 137, 0.45)',
          surface: 'rgba(255, 19, 137, 0.14)',
        },
        moonlight: {
          DEFAULT: '#FAF6EE',
          muted: '#B8AF9F',
          faint: '#6E6659',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Space Grotesk', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
      boxShadow: {
        'glow-brass': '0 0 16px rgba(198, 161, 91, 0.35)',
        'glow-lime': '0 0 20px rgba(46, 255, 163, 0.40)',
        'glow-amber': '0 0 20px rgba(255, 122, 0, 0.40)',
        'glow-magenta': '0 0 22px rgba(255, 19, 137, 0.45)',
        'glow-violet': '0 0 20px rgba(157, 78, 221, 0.40)',
        'inner-glass': 'inset 0 1px 1px 0 rgba(250, 246, 238, 0.12)',
      },
      animation: {
        'liquid-wave': 'wave 3.5s ease-in-out infinite',
        'bubble-float': 'bubbleFloat 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-brass': 'brassShimmer 6s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(-2%) translateY(0) scaleY(1)' },
          '50%': { transform: 'translateX(2%) translateY(-3px) scaleY(1.05)' },
        },
        bubbleFloat: {
          '0%': { transform: 'translateY(12px) scale(0.7)', opacity: '0' },
          '40%': { opacity: '0.8' },
          '80%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-24px) scale(1.1)', opacity: '0' },
        },
        brassShimmer: {
          '0%': { borderColor: 'rgba(198, 161, 91, 0.25)' },
          '50%': { borderColor: 'rgba(229, 195, 120, 0.55)' },
          '100%': { borderColor: 'rgba(198, 161, 91, 0.25)' },
        }
      }
    },
  },
} satisfies Partial<Config>;
