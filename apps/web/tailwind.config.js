/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0D14',
          card: '#121722',
          surface: '#1A2130',
          border: '#2A3447',
        },
        brand: {
          blue: '#3B82F6',
          electric: '#2563EB',
          glow: '#60A5FA',
        },
      },
    },
  },
  plugins: [],
};
