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
        accent: {
          50: 'var(--accent-color-50)',
          100: 'var(--accent-color-100)',
          200: 'var(--accent-color-200)',
          300: 'var(--accent-color-300)',
          400: 'var(--accent-color-400)',
          500: 'var(--accent-color-500)',
          600: 'var(--accent-color-600)',
          700: 'var(--accent-color-700)',
          800: 'var(--accent-color-800)',
          900: 'var(--accent-color-900)',
          950: 'var(--accent-color-950)',
          'contrast': 'var(--accent-color-contrast)',
        },
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'modal-show': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'modal-show': 'modal-show 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}