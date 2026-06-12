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
        ink: "#09090b", // zinc-950
        panel: "#18181b", // zinc-900
        cyan: "#0ea5e9", // indigo/blue vibe for enterprise instead of raw cyan
        primary: "#3b82f6", // blue-500
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.92)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(900%)" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 2.4s ease-in-out infinite",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
