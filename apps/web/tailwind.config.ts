import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        swap: {
          dark: '#08090E',
          surface: '#11131E',
          card: '#161928',
          border: '#24283E',
          muted: '#8E96B0',
          indigo: '#4F46E5',
          pink: '#EC4899',
          amber: '#F59E0B',
          glow: 'rgba(236, 72, 153, 0.15)',
        },
      },
      backgroundImage: {
        'swap-gradient': 'linear-gradient(135deg, #4F46E5 0%, #EC4899 50%, #F59E0B 100%)',
        'swap-gradient-hover': 'linear-gradient(135deg, #4338CA 0%, #DB2777 50%, #D97706 100%)',
        'swap-glow': 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.22), rgba(79, 70, 229, 0.12), transparent 70%)',
        'story-ring': 'linear-gradient(45deg, #F59E0B, #EC4899, #4F46E5)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-swap': '0 0 25px -5px rgba(236, 72, 153, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'heart-burst': 'heartBurst 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.12)', opacity: '1' },
        },
        heartBurst: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
