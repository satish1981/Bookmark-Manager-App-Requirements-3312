/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['Roboto', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'heading': ['Plus Jakarta Sans', 'Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        'youtube': {
          'red': '#FF0000',
          'red-dark': '#CC0000',
          'red-light': '#FF3333',
          'dark': '#0F0F0F',
          'light': '#F9F9F9',
        },
        'gradient': {
          'primary': '#ff0844',
          'secondary': '#667eea',
          'accent': '#f093fb',
        }
      },
      backgroundImage: {
        'gradient-youtube': 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        'gradient-primary': 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-dark': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 10px 40px rgba(255, 8, 68, 0.2)',
        'glow-lg': '0 15px 50px rgba(255, 8, 68, 0.3)',
        'glow-secondary': '0 10px 40px rgba(102, 126, 234, 0.2)',
        'glow-secondary-lg': '0 15px 50px rgba(102, 126, 234, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'elevated': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'neon': '0 0 20px rgba(255, 8, 68, 0.5)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-3d': 'spin-3d 1.5s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'slideInRight': 'slideInRight 0.5s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 8, 68, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 8, 68, 0.6)',
            transform: 'scale(1.02)'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-3d': {
          '0%': { transform: 'rotate(0deg) rotateY(0deg)' },
          '50%': { transform: 'rotate(180deg) rotateY(90deg)' },
          '100%': { transform: 'rotate(360deg) rotateY(0deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backdropBlur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      perspective: {
        '500': '500px',
        '1000': '1000px',
        '1500': '1500px',
      },
      transformOrigin: {
        'center-center': '50% 50%',
        'top-center': '50% 0%',
        'bottom-center': '50% 100%',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.perspective-500': {
          perspective: '500px',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.perspective-1500': {
          perspective: '1500px',
        },
        '.transform-style-preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-glow': {
          textShadow: '0 0 10px rgba(255, 8, 68, 0.5)',
        },
        '.gradient-text': {
          background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      })
    },
  ],
}