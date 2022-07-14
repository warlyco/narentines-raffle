/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amber: {
          400: "#d7ad6d",
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "h-screen",
    "w-full",
    "flex",
    "flex-col",
    "flex-1",
    "items-center",
    "bg-amber-400",
    "justify-center",
  ],
};
