/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3',
          foreground: 'white',
        },
        foreground: {
          DEFAULT: '#000000',
        },
        muted: {
          foreground: '#666666',
        },
      },
    },
  },
}