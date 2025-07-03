/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#C5A572',
        background: '#FFFFFF',
        text: '#2C2C2C',
        accent: '#F8F9FA',
        trust: '#4A90E2',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        sourcesans: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
