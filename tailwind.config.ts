import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Aura — Warm Editorial palette (CSS variables for light/dark)
        background: {
          DEFAULT: "var(--bg)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          DEFAULT: "var(--border)",
        },
        text: {
          primary: "var(--text-primary)",
          body: "var(--text-body)",
          muted: "var(--text-muted)",
        },
        accent: {
          amber: "var(--accent-amber)",
          blue: "var(--accent-blue)",
        },
        // Semantic surface colors for hardcoded values
        surface: {
          subtle: "var(--surface-subtle)",
          hover: "var(--surface-hover)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        tighter: "-0.02em",
      },
      borderRadius: {
        pill: "9999px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
