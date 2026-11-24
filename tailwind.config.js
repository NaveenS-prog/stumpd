/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        turf: {
          base: '#0A1813',
          card: '#12261E',
          border: '#214436',
          muted: '#8BA89B',
          950: '#07110D',
          900: '#0A1813',
          800: '#12261E',
          700: '#214436',
          600: '#2E5A48',
          400: '#52826E',
          300: '#8BA89B',
          200: '#C2D6CE',
        },
        gold: {
          300: '#F5BE58',
          400: '#E5A93B',
          500: '#D99824',
        },
        cricket: {
          gold: '#E5A93B',
          'gold-hover': '#F5BE58',
        },
        stumpd: {
          text: '#F0FDF4',
          win: '#22C55E',
          loss: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
