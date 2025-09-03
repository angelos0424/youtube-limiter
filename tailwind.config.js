/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        'brand-red': '#FF0000',
        'brand-dark': '#212121',
      }
    }
  },
  plugins: [],
}
