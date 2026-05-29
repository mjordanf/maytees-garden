import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0faf4',
          100: '#d8f3dc',
          200: '#b7e4c7',
          300: '#74c69d',
          400: '#52b788',
          500: '#40916c',
          600: '#2d6a4f',
          700: '#1b4332',
          800: '#1b3a2d',
          900: '#081c15',
        },
        terra: {
          50:  '#fdf2f0',
          100: '#fce0d9',
          200: '#f9c0b3',
          300: '#f4967e',
          400: '#e9967a',
          500: '#bc4b35',
          600: '#a03d2b',
          700: '#7d2f20',
          800: '#5a1f14',
        },
        cream: '#faf7f2',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, rgba(27,58,45,0.85) 0%, rgba(45,106,79,0.70) 100%)",
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                    to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}

export default config
