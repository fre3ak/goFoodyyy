// frontend/tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff5c1f', // The main brand color (vibrant orange-red)
        secondary: '#3e4062', // Deep blue-gray
        black: '#000000',
        white: '#ffffff',
      },
      textColor: {
        DEFAULT: '#000000',
      },
      backgroundColor: {
        DEFAULT: '#ffffff',
      },
    },
  },
  plugins: [],
}