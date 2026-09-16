/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14171A",
          soft: "#4B5259",
        },
        paper: "#FFFFFF",
        panel: "#F5F6F8",
        line: "#E4E7EB",
        signal: {
          DEFAULT: "#2F5DFF",
          dark: "#1E3FCC",
          soft: "#EAEFFF",
        },
        good: { DEFAULT: "#1D9A6C", soft: "#E4F6EE" },
        warn: { DEFAULT: "#B8860B", soft: "#FBF2DC" },
        bad: { DEFAULT: "#D8442B", soft: "#FCEAE6" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20,23,26,0.04), 0 1px 0 rgba(20,23,26,0.03)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "count-ring": {
          "0%": { strokeDashoffset: "var(--ring-start)" },
          "100%": { strokeDashoffset: "var(--ring-end)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "scan-line": "scan-line 1.8s ease-in-out infinite",
        "count-ring": "count-ring 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
