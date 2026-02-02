import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aura Brand Colors
        background: {
          DEFAULT: "#0A0B10", // Deep Charcoal
          elevated: "#13151E", // Elevated/Cards
        },
        border: {
          DEFAULT: "#1F2937", // Subtle borders
        },
        text: {
          primary: "#FFFFFF", // Headlines
          body: "#E5E7EB", // Body text
          muted: "#9CA3AF", // Inactive/muted
        },
        accent: {
          blue: "#3B82F6", // Electric Blue
          violet: "#8B5CF6", // Vivid Violet
        },
      },
      backgroundImage: {
        "gradient-aura": "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
        "gradient-aura-hover": "linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.02em",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
