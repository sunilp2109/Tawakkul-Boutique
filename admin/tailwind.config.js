/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#d4af37',
          600: '#b8960c',
          700: '#a07810',
          800: '#835d0e',
          900: '#6b4a10',
        },
        dark: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#303030',
          800: '#1a1a2e',
          900: '#0a0a0f',
          950: '#06060a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
