/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // <-- Add this
    "./src/**/*.{js,ts,jsx,tsx}", // <-- And this
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}