import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tracer: {
          bg: "#0f1117",
          surface: "#1a1d27",
          border: "#2a2d3a",
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          llm: "#3b82f6",
          agent: "#8b5cf6",
          tool: "#f59e0b",
          retriever: "#14b8a6",
          evaluator: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  safelist: [
    // Span kind badge colors — safelisted to prevent JIT purge
    "bg-tracer-llm",
    "bg-tracer-agent",
    "bg-tracer-tool",
    "bg-tracer-retriever",
    "bg-tracer-evaluator",
    "text-tracer-llm",
    "text-tracer-agent",
    "text-tracer-tool",
    "text-tracer-retriever",
    "text-tracer-evaluator",
    "border-tracer-llm",
    "border-tracer-agent",
    "border-tracer-tool",
    "border-tracer-retriever",
    "border-tracer-evaluator",
  ],
};

export default config;
