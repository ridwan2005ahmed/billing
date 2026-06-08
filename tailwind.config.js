/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B5ED7',
        secondary: '#198754',
        warning: '#FFC107',
        danger: '#DC3545',
        surface: '#FFFFFF',
        canvas: '#F5F7FB',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)',
        card: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(rgba(11, 94, 215, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 94, 215, 0.08) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: [
          'system-ui',
          'Segoe UI',
          'Noto Sans Bengali',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};