/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./Views/**/*.cshtml",
    "./wwwroot/js/**/*.js",
    "./wwwroot/css/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-color)',
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'tertiary': 'var(--third-color)',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        teko: ['Teko', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
