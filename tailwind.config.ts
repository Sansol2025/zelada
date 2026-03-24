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
          50: "#ecf8ff",
          100: "#d3efff",
          200: "#b0e2ff",
          300: "#7aceff",
          400: "#43b8f4",
          500: "#1e99d3",
          600: "#1a7bb0",
          700: "#1a648e",
          800: "#1d5373",
          900: "#1f4560",
          950: "#122b3f"
        },
        soft: {
          sky: "#f4faff",
          mint: "#e9f9ef",
          sun: "#fff9dc"
        }
      },
      boxShadow: {
        card: "0 20px 40px -30px rgba(31, 69, 96, 0.45)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
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
