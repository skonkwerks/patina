/** @type {import("prettier").Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn', 'tv'],
  singleQuote: true,
  jsxSingleQuote: true,
};

export default config;
