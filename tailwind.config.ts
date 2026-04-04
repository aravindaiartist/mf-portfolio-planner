import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b0f1e",
          900: "#0f1629",
          800: "#141b35",
          700: "#1a2340",
          600: "#1e2a4a",
        },
        brand: {
          purple: "#7c3aed",
          violet: "#8b5cf6",
          indigo: "#6366f1",
          blue: "#3b82f6",
          teal: "#14b8a6",
          green: "#10b981",
          emerald: "#059669",
        },
        accent: {
          DEFAULT: "#10b981",
          light: "#34d399",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        negative: "#f43f5e",
        warn: "#f59e0b",
        glass: {
          bg: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.09)",
          hover: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow": "glow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(16,185,129,0.10) 0%, transparent 60%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        "accent": "0 0 24px rgba(16,185,129,0.2)",
        "purple": "0 0 24px rgba(139,92,246,0.2)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
