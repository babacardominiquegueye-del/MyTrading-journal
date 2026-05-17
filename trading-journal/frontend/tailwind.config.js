/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette TradingView Dark
        dark: {
          900: "#0d0f14",
          800: "#131722",
          700: "#1e2230",
          600: "#2a2e39",
          500: "#363a45",
          400: "#4a4f5e",
        },
        accent: {
          green: "#26a69a",
          red:   "#ef5350",
          blue:  "#2196f3",
          gold:  "#f5a623",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
