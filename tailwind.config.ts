import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0f1a",
          900: "#0d1321",
          800: "#111827",
          700: "#1a2235",
          600: "#1e2d44",
        },
        accent: {
          DEFAULT: "#10b981",
          light: "#14b8a6",
        },
        negative: "#f43f5e",
        warn: "#f59e0b",
        glass: {
          bg: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
