import type { Config } from 'tailwindcss';

// ─── Change this one constant to retheme the entire app ───────────────────────
const PRIMARY = '#FACC15'; // yellow-400

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
          DEFAULT: PRIMARY,
          dark: '#CA8A04',  // hover / active states
          light: '#FEF08A', // tint backgrounds
        },
        brand: {
          gold: PRIMARY,    // alias — all existing brand-gold classes stay unchanged
          dark: '#000000',  // pure black, replaces navy
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
