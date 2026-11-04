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
