/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: "0.9rem",
        sm: "1.1rem",
      },
      backgroundImage: {
        "main-pattern": 'url("./images/bg-pattern.png")',
        "bg-black-image": 'url("./images/bg-black.png")',
      },
      boxShadow: {
        deep: "11px 20px 19px 0px rgba(0,0,0,0.53);",
        "deep-float": "8px 20px 24px 4px rgba(0,0,0,0.4)",
      },
      colors: {
        amber: {
          200: "#e9cfa6",
          300: "#F7CCA3",
          400: "#d7ad6d",
        },
        green: {
          800: "#69754e",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
  safelist: [
    "overflow-x-hidden",
    "min-h-screen",
    "h-full",
    "w-full",
    "max-w-5xl",
    "flex",
    "flex-col",
    "flex-1",
    "items-center",
    "bg-amber-400",
    "justify-center",
    "px-4",
  ],
};
