/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // The older pages style themselves with plain CSS files; preflight's
    // resets would change their look. Utilities only.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
