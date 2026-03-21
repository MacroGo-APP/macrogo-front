/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        amarelo: "#FBD334",
        vermelho: "#DA3939",
        verde: "#56BE30",
        laranja: "#F0903A",
        azul: "#2C6BCA",
        branco: "#FFFCF6",
        cinza: {
          100: "#E2E2E2", 
          200: "#B2B2B2", 
          300: "#333333"
        },
        preto: "#1B1B1B"
      }
    },
  },
  plugins: [],
}

