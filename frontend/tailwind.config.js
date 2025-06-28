/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy Blue Palette
        'navy': {
          primary: '#2C3E50',
          secondary: '#34495E',
          dark: '#1A252F',
          light: '#3F5A7A',
        },
        // Brand accent colors (avoid overriding default yellow scale)
        'brand-yellow': '#F39C12',
        'brand-orange': '#E67E22',
        'brand-gold': '#F1C40F',
        // Text Colors
        'text-light': '#ECF0F1',
        'text-gray': '#BDC3C7',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #2C3E50 100%)',
        'hero-gradient': 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'drone': 'drone-fly 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(5deg)' 
          },
        },
        'drone-fly': {
          '0%, 100%': { 
            transform: 'translateX(0px) translateY(0px)' 
          },
          '25%': { 
            transform: 'translateX(20px) translateY(-10px)' 
          },
          '50%': { 
            transform: 'translateX(0px) translateY(-20px)' 
          },
          '75%': { 
            transform: 'translateX(-20px) translateY(-10px)' 
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(243, 156, 18, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(243, 156, 18, 0.6)' 
          },
        },
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'yellow': '0 4px 20px rgba(243, 156, 18, 0.4)',
        'soft': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'cairo': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}