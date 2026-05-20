/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-end aesthetic dark theme & dynamic accents
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d5dde9',
          300: '#b3c3d7',
          400: '#8ca1c2',
          500: '#6981ab',
          600: '#536891',
          700: '#435377',
          800: '#394663',
          900: '#313b52',
          950: '#202636',
        }
      }
    },
  },
  plugins: [],
}
