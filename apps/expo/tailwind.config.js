/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Greens ───────────────────────────────────────────────────
        green: {
          900: "#0b130d",
          800: "#102015",
          700: "#17301f",
          600: "#1c2415",
          500: "#2b3324",
          400: "#2f6b3b",
          300: "#5d6558",
        },
        // ── Golds ────────────────────────────────────────────────────
        gold: {
          500: "#e9b949",
          400: "#eeb040",
          300: "#f0b429",
        },
        // ── Creams ───────────────────────────────────────────────────
        cream: {
          100: "#f7f0de",
          200: "#f6f1e6",
          300: "#f8f4eb",
          400: "#fffdf7",
        },
        // ── Semantic theme tokens ────────────────────────────────────
        "dark-bg": "#102015",
        "dark-surface": "#17301f",
        "dark-text": "#f7f0de",
        "dark-text-secondary": "rgba(247,240,222,0.82)",
        "dark-text-tertiary": "rgba(247,240,222,0.76)",
        "dark-accent": "#e9b949",
        "dark-accent-text": "#18210f",
        "dark-border": "rgba(255,255,255,0.08)",
        "dark-border-strong": "rgba(255,255,255,0.12)",
        "dark-surface-subtle": "rgba(255,255,255,0.04)",

        "light-bg": "#f6f1e6",
        "light-surface": "#ffffff",
        "light-text": "#1c2415",
        "light-text-secondary": "#2b3324",
        "light-text-tertiary": "#5d6558",
        "light-accent": "#2f6b3b",
        "light-accent-text": "#f6f1e6",
        "light-border": "#ded5c3",
        "light-border-strong": "#d7cfbe",
        "light-surface-subtle": "#fffdf7",
      },
    },
  },
  plugins: [],
};
