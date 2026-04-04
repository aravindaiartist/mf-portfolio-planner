import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { // keeping navy tokens in case some files still use them, but redefining to white-ish for safety
          950: "#f8fafc",
          900: "#ffffff",
          800: "#f1f5f9",
          700: "#e2e8f0",
          600: "#cbd5e1",
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        accent: {
          DEFAULT: "#059669",
          light: "#10b981",
        },
        negative: "#ef4444",
        warn: "#f59e0b",
        glass: {
          bg: "rgba(255, 255, 255, 0.7)",
          border: "rgba(226, 232, 240, 0.8)",
          hover: "rgba(241, 245, 249, 0.8)",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
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
