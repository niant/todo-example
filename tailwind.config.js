module.exports = {
  purge: ["./src/client/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minWidth: {
        20: "20em",
      },
      maxWidth: {
        27: "27em",
      },
      borderWidth: {
        DEFAULT: "thin",
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ["hover"],
      borderColor: ["active"],
    },
  },
  plugins: [],
};
