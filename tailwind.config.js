/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        stone: {
          950: '#0c0a09', 900: '#1c1917', 800: '#292524',
          700: '#44403c', 600: '#57534e', 500: '#78716c',
          400: '#a8a29e', 300: '#d6d3d1', 200: '#e7e5e4',
        },
        fire:  { 600: '#dc2626', 500: '#ef4444' },
        ember: { 600: '#ea580c', 500: '#f97316', 400: '#fb923c' },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'fire-grad': 'linear-gradient(135deg, #dc2626, #ea580c, #f59e0b)',
      },
      boxShadow: {
        fire:    '0 0 20px rgba(234,88,12,0.35)',
        'fire-lg':'0 0 40px rgba(234,88,12,0.5)',
      },
    }
  },
  plugins: []
}
