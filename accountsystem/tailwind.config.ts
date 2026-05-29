import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563eb",
          accent: "#06b6d4",
          surface: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 60px -25px rgba(15,23,42,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
