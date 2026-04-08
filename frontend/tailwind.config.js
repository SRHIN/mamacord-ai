/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B1A1A",
        accent: "#F4C47A",
        background: "#FAFAF8",
        success: "#16A050",
        warning: "#DCA800",
        danger: "#C81E1E",
      },
      fontFamily: {
        mono: ["Courier New", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};
