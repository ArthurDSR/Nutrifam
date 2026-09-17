/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#f0fdf9',
          100: '#d7f7ee',
          200: '#aef0de',
          300: '#75e4ca',
          400: '#48cfad',
          500: '#20b794',
          600: '#149377',
        },
        navy: {
          900: '#131d27',
          800: '#1a2734',
          700: '#233242',
          600: '#334456',
        },
        app: {
          bg: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      }
    },
  },
  plugins: [],
}
