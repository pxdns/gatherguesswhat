import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexa: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#0066ff",
          600: "#0052cc",
          700: "#003d99",
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
