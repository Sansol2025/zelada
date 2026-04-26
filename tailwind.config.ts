import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8f5f0",  // Bone/Ivory base
          100: "#f1ede4",
          200: "#e4dac6",
          300: "#d7c7a8",
          400: "#c5a059", // Academic Gold
          500: "#1a2b3c", // Deep Navy
          600: "#2e4a3e", // Forest Green
          700: "#1a3b5c",
          800: "#0f2135",
          900: "#081421",
          950: "#040a12"
        },
        academic: {
          ivory: "#F8F5F0",
          navy: "#1A2B3C",
          forest: "#2E4A3E",
          gold: "#C5A059",
          slate: "#4A5568"
        },
        soft: {
          sky: "#f4faff",
          mint: "#e9f9ef",
          sun: "#fff9dc"
        },
        subject: {
          coral: "#ff6b6b",
          sky: "#4dabf7",
          lime: "#82c91e",
          violet: "#9775fa",
          orange: "#ff922b",
          teal: "#20c997",
          pink: "#f783ac",
          indigo: "#5c7cfa"
        }
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(26, 43, 60, 0.12)",
        premium: "0 20px 40px -15px rgba(26, 43, 60, 0.15)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
