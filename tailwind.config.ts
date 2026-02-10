import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1280px",
      xl: "1440px",
    },
    extend: {
      colors: {
        background: "#1A1A1A",
        foreground: "#FFFFFF",
        accent: "#CCCCCC",
        muted: "#888888",
        overlay: "rgba(0, 0, 0, 0.6)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Noto Sans KR",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "logo-rise": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-out": "fade-out 0.4s ease-in forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "logo-rise": "logo-rise 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
