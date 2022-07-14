/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: {
          200: "#e9cfa6",
          400: "#d7ad6d",
        },
        green: {
          800: "#69754e",
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "min-h-screen",
    "h-full",
    "w-full",
    "flex",
    "flex-col",
    "flex-1",
    "items-center",
    "bg-amber-400",
    "justify-center",
    "px-4",
  ],
};
