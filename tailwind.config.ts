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
        bg: {
          main: "#161311",
          sidebar: "#14110F",
          panel: "#211C18",
          card: "#26211D",
          elevated: "#2F2924",
        },
        border: {
          subtle: "#3B342D",
          soft: "#2C2620",
        },
        amber: {
          DEFAULT: "#C8A96B",
          bright: "#D6B77A",
          deep: "#8D6E3E",
        },
        "text-main": "#F2ECE3",
        "text-secondary": "#C1B29F",
        "text-muted": "#8B7E72",
        success: "#4E8A62",
        error: "#A44D45",
        warning: "#C48A41",
        info: "#6E8BAB",
        board: {
          light: "#D7C1A0",
          dark: "#8A6A45",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        display: ["56px", { lineHeight: "1.02", fontWeight: "800", letterSpacing: "-0.035em" }],
        h1: ["30px", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        h2: ["22px", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" }],
        h3: ["17px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" }],
        eyebrow: ["11px", { fontWeight: "600", letterSpacing: "0.14em" }],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
        full: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.30)",
        DEFAULT: "0 4px 16px rgba(0,0,0,.30)",
        lg: "0 14px 40px rgba(0,0,0,.40)",
        amber: "0 0 0 1px rgba(200,169,107,.32), 0 6px 20px rgba(0,0,0,.28)",
      },
      spacing: {
        sidebar: "232px",
        topbar: "64px",
      },
      animation: {
        "card-in": "cardIn 0.5s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fadeIn 0.22s ease both",
        "fade-up": "fadeUp 0.38s cubic-bezier(.2,.7,.2,1) both",
        "bar-fill": "barFill 0.7s cubic-bezier(.2,.7,.2,1) both",
        "heat-in": "heatIn 0.4s cubic-bezier(.2,.7,.2,1) both",
        "pulse-correct": "pulseCorrect 0.55s ease both",
        "glow-wrong": "glowWrong 0.5s ease both",
        "board-shake": "boardShake 0.4s cubic-bezier(.36,.07,.19,.97)",
        spin: "spin 0.7s linear infinite",
        shimmer: "shimmer 1.4s infinite",
      },
      keyframes: {
        cardIn: {
          from: { transform: "translateY(12px) scale(0.985)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        fadeIn: {
          from: { transform: "translateY(5px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        fadeUp: {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        barFill: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        heatIn: {
          from: { transform: "scale(.35)" },
          to: { transform: "scale(1)" },
        },
        pulseCorrect: {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(78,138,98,0)" },
          "35%": { transform: "scale(1.012)", boxShadow: "0 0 0 5px rgba(78,138,98,.30)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(78,138,98,0)" },
        },
        glowWrong: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(164,77,69,0)" },
          "40%": { boxShadow: "0 0 0 4px rgba(164,77,69,.34)" },
        },
        boardShake: {
          "10%, 90%": { transform: "translateX(-2px)" },
          "20%, 80%": { transform: "translateX(4px)" },
          "30%, 50%, 70%": { transform: "translateX(-8px)" },
          "40%, 60%": { transform: "translateX(8px)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
        shimmer: { to: { backgroundPosition: "-200% 0" } },
      },
      transitionDuration: {
        "140": "140ms",
        "160": "160ms",
        "180": "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
