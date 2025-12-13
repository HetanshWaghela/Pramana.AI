export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#FDE047',
        'brand-pink': '#FCA5C4',
        'brand-blue': '#BFDBFE',
        'brand-green': '#4ADE80',
      },
      fontFamily: {
        'sans': ['Lexend', 'system-ui', 'sans-serif'],
        'cause': ['Cause', 'cursive'],
      },
    },
  },
  plugins: [],
}
