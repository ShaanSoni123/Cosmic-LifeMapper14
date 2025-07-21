/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin 30s linear infinite reverse',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};