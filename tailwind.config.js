/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noche: '#1F2A44',
        crema: '#FFF6E5',
        sol: '#FFC93C',
        atardecer: '#FF7A3D',
        rosa: '#FF5D8F',
        monte: '#2F9E6B',
        cielo: '#2D9CDB',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        comic: '4px 4px 0 0 #1F2A44',
        'comic-sm': '2px 2px 0 0 #1F2A44',
        soft: '0 10px 30px -10px rgba(31,42,68,.35)',
      },
      keyframes: {
        bounceSoft: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        bounceSoft: 'bounceSoft 1.4s ease-in-out infinite',
        wiggle: 'wiggle .6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
