/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px -32px rgba(15, 23, 42, 0.35)',
        panel: '0 20px 45px -25px rgba(15, 23, 42, 0.45)',
      },
      backgroundImage: {
        'mesh-radial':
          'radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.14), transparent 30%), radial-gradient(circle at bottom, rgba(16, 185, 129, 0.12), transparent 45%)',
      },
      animation: {
        'float-slow': 'floatSlow 16s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 7s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
};

