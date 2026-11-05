import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--bg-main)",
          card: "var(--bg-card)",
          secondary: "var(--bg-surface)",
          tertiary: "var(--border-main)",
        },
        esports: {
          amber: {
            DEFAULT: "#dc2626", // Solid Crimson Red
            glow: "#b91c1c",
            dark: "#991b1b",
          },
          cyan: {
            DEFAULT: "#dc2626",
            glow: "#b91c1c",
            dark: "#991b1b",
          },
          purple: "#71717a",
          emerald: "#dc2626",
          rose: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Outfit", "Inter", "sans-serif"],
        gaming: ["Poppins", "Rajdhani", "sans-serif"],
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant("light", "html:not(.dark) &");
    }),
  ],
}
