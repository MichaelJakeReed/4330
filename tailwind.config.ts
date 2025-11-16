import type { Config } from "tailwindcss";
// import { fontFamily } from "tailwindcss/defaultTheme"; // <-- This line was wrong for v4. It's removed.

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This is the new v4 way.
        // We just provide our font variable, and Tailwind
        // will automatically add its own sensible fallback fonts.
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;