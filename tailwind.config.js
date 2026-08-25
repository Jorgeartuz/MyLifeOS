/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
        },
        background: "#F5F7FA",
        surface: "#FFFFFF",
        text: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
        },
        border: "#E5E7EB",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};