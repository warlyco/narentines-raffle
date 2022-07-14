/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "h-screen",
    "w-full",
    "flex",
    "flex-col",
    "flex-1",
    "items-center",
    "justify-center",
  ],
};
