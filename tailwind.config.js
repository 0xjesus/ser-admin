/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          // ... otros tonos si los necesitas
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        green: {
          100: "#dcfce7",
          800: "#166534",
        },
        red: {
          100: "#fee2e2",
          800: "#991b1b",
        },
        yellow: {
          100: "#fef9c3",
          800: "#854d0e",
        },
        purple: {
          100: "#f3e8ff",
          800: "#6b21a8",
        }
      }
    },
  },
  plugins: [],
}
