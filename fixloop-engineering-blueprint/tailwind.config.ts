import type { Config } from "tailwindcss";

const config: Config = {
  // No darkMode class — design.md specifies light surfaces
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FixLoop brand tokens (design.md §3)
        fl: {
          "blue-900": "#17365A",
          "blue-800": "#214B78",
          "blue-700": "#2F5F91",
          "blue-600": "#3E74A8",
          "blue-100": "#E7EFF7",
          "blue-050": "#F3F7FB",
          page: "#FFFFFF",
          surface: "#FFFFFF",
          "surface-muted": "#F7F9FC",
          border: "#D8E0E9",
          text: "#17212F",
          "text-muted": "#526173",
          success: "#216E4A",
          warning: "#8A5700",
          danger: "#B42318",
          info: "#245B86",
        },
        // Retained for case severity (design.md keeps functional status colours)
        severity: {
          critical: "#B42318",
          high: "#C2570B",
          medium: "#8A5700",
          low: "#245B86",
          effective: "#216E4A",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      borderRadius: {
        // design.md §5: 8-10 px controls, 12-16 px cards
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        // design.md §5: prefer borders over large diffuse shadows
        card: "0 1px 3px 0 rgba(23, 33, 47, 0.06), 0 1px 2px -1px rgba(23, 33, 47, 0.04)",
        "card-md": "0 4px 8px -2px rgba(23, 33, 47, 0.08), 0 2px 4px -2px rgba(23, 33, 47, 0.04)",
        "btn-primary": "0 1px 3px 0 rgba(47, 95, 145, 0.25)",
      },
      maxWidth: {
        content: "1200px",  // public site: design.md §5
        app: "1440px",      // authenticated app: design.md §5
      },
    },
  },
  plugins: [],
};

export default config;
