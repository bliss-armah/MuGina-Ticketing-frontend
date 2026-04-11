import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fbd48d',
          300: '#f9c461',
          400: '#f8b842',
          500: '#f6ab2a',
          600: '#e59d25',
          700: '#cc8a1e',
          800: '#b37818',
          900: '#8c5c0f',
        },
        brand: {
          gold: '#F6AB2A',
          dark: '#1a1a2e',
          green: '#16a34a',
          red: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
