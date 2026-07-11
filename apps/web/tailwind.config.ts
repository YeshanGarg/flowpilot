import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f4",
          100: "#d8f0e3",
          500: "#1f8f5f",
          700: "#166a46",
          900: "#0d3f29"
        }
      }
    },
  },
  plugins: [],
};

export default config;
