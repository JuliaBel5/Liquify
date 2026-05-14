import type { Config } from 'tailwindcss';

const liquidSafelist = [
  'bg-rose-500', 'border-rose-700', 'shadow-rose-500/50',
  'bg-orange-500', 'border-orange-700', 'shadow-orange-500/50',
  'bg-yellow-300', 'border-yellow-500', 'shadow-yellow-300/50',
  'bg-lime-500', 'border-lime-700', 'shadow-lime-500/50',
  'bg-emerald-500', 'border-emerald-700', 'shadow-emerald-500/50',
  'bg-pink-500', 'border-pink-700', 'shadow-pink-500/50',
  'bg-sky-600', 'border-sky-800', 'shadow-sky-600/50',
  'bg-purple-700', 'border-purple-900', 'shadow-purple-700/50',
  'bg-fuchsia-500', 'border-fuchsia-700', 'shadow-fuchsia-500/50',
  'bg-rose-300', 'border-rose-500', 'shadow-rose-300/50',
];

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  safelist: liquidSafelist,
  theme: {
    extend: {
      colors: {
        lab: {
          ink: '#05070d',
          panel: 'rgba(15, 23, 42, 0.72)',
          glass: 'rgba(226, 232, 240, 0.10)',
          line: 'rgba(148, 163, 184, 0.28)',
          glow: '#67e8f9',
          acid: '#d9f99d',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-serif', 'serif'],
      },
      boxShadow: {
        glass: '0 24px 80px rgba(8, 13, 30, 0.42)',
        tube: '0 18px 40px rgba(103, 232, 249, 0.14)',
      },
      keyframes: {
        'hint-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 249, 157, 0.58)' },
          '50%': { boxShadow: '0 0 0 14px rgba(217, 249, 157, 0)' },
        },
        'pour-source': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '45%': { transform: 'translateY(-10px) rotate(-7deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
        'pour-target': {
          '0%': { transform: 'scaleY(0.96)', filter: 'brightness(1)' },
          '65%': { transform: 'scaleY(1.04)', filter: 'brightness(1.2)' },
          '100%': { transform: 'scaleY(1)', filter: 'brightness(1)' },
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'hint-pulse': 'hint-pulse 2s ease-in-out',
        'pour-source': 'pour-source 320ms ease-out',
        'pour-target': 'pour-target 320ms ease-out',
        'dialog-in': 'dialog-in 220ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
