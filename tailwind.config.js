/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sci: {
          bg: '#080c14',
          surface: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(20, 30, 48, 0.65)',
          accent: '#38bdf8',
          success: '#10b981',
          danger: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
