/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './apps/web/**/*.{js,ts,jsx,tsx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090f',
        surface: {
          DEFAULT: '#0c101a',
          light: '#121726',
          lighter: '#1a2236',
          border: '#222d47',
        },
        electric: {
          blue: '#0066FF',
          cyan: '#00F0FF',
          violet: '#7000FF',
          purple: '#8A2BE2',
        },
        neon: {
          blue: '#00A3FF',
          violet: '#9933FF',
        },
        text: {
          DEFAULT: '#FFFFFF',
          muted: '#A1A1AA',
          subtle: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(0, 102, 255, 0.45)',
        'glow-violet': '0 0 25px -5px rgba(112, 0, 255, 0.45)',
        'glow-cyan': '0 0 20px -5px rgba(0, 240, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float-slow': 'floating 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        floating: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
