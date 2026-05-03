import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C41230",
          2: "#9B0E25",
          foreground: "#ffffff",
          50: "#fff0f2",
          100: "#ffe0e5",
          600: "#C41230",
          700: "#9B0E25",
          800: "#7f0d1f",
        },
        off: "#F6F4F1",
        ink: "#0F0A0B",
        sidebar: {
          DEFAULT: "#F6F4F1",
          foreground: "#0F0A0B",
          accent: "#ece9e4",
          "accent-foreground": "#C41230",
          border: "rgba(0,0,0,0.07)",
        },
        muted: {
          DEFAULT: "#ece9e4",
          foreground: "#888",
        },
        destructive: {
          DEFAULT: "#C41230",
          foreground: "#ffffff",
        },
        border: "rgba(0,0,0,0.09)",
        input: "rgba(0,0,0,0.09)",
        ring: "#C41230",
        background: "#F6F4F1",
        foreground: "#0F0A0B",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0F0A0B",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
