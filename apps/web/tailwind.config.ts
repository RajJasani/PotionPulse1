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
        // Hacktoberfest-inspired light & vibrant palette
        cream: '#FFFDF9',
        sand: '#FAF5EE',
        sandDark: '#EFE7D8',
        ink: '#1A1523',
        inkLight: '#3D344B',
        mutedText: '#6F657E',
        surfaceBorder: '#1A1523',

        hackOrange: {
          DEFAULT: '#FF5C00',
          hover: '#E55300',
          light: '#FFF0EB',
          border: '#D94D00',
        },
        hackAmber: {
          DEFAULT: '#FFBE1A',
          hover: '#F0B010',
          light: '#FFF9E6',
        },
        hackPink: {
          DEFAULT: '#FF2E93',
          hover: '#E52080',
          light: '#FFEBF4',
        },
        hackPurple: {
          DEFAULT: '#6320EE',
          hover: '#5214D6',
          light: '#F3EDFF',
        },
        hackMint: {
          DEFAULT: '#06D6A0',
          hover: '#05BF8E',
          light: '#E8FAF5',
        },
        hackCyan: {
          DEFAULT: '#00B4D8',
          hover: '#009EC0',
          light: '#E6F8FC',
        },
        hackRed: {
          DEFAULT: '#E63946',
          hover: '#D02936',
          light: '#FDECEE',
        },

        // Backward compatibility mappings
        potionPurple: {
          DEFAULT: '#6320EE',
          hover: '#5214D6',
          light: '#8E6BE0',
        },
        violetGlow: '#6320EE',
        emberOrange: '#FF5C00',
        pumpkin: '#FF5C00',
        cauldronGreen: '#06D6A0',
        paleLavender: '#1A1523', // In light theme, text is ink
        cloudWhite: '#FFFFFF',
        successGreen: '#06D6A0',
        warningAmber: '#FFBE1A',
        dangerRed: '#E63946',
      },
      boxShadow: {
        'retro-xs': '1px 1px 0px #1A1523',
        'retro-sm': '2px 2px 0px #1A1523',
        'retro': '4px 4px 0px #1A1523',
        'retro-md': '5px 5px 0px #1A1523',
        'retro-lg': '6px 6px 0px #1A1523',
        'retro-xl': '8px 8px 0px #1A1523',
        'retro-orange': '4px 4px 0px #FF5C00',
        'retro-purple': '4px 4px 0px #6320EE',
        'retro-mint': '4px 4px 0px #06D6A0',
        'retro-pink': '4px 4px 0px #FF2E93',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
