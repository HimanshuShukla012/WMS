export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'animate-bubble'  // 👈 Ensure this gets included
  ],
  theme: {
    extend: {
      keyframes: {
        bubble: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "100%": { transform: "translateY(-100vh) scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        bubble: "bubble 4s linear infinite", // 👈 Add default duration
      },
    },
  },
  plugins: [],
}
