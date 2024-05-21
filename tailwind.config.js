/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  colors: {
    'text': 'var(--text)',
    'background': 'var(--background)',
    'primary': 'var(--primary)',
    'secondary': 'var(--secondary)',
    'accent': 'var(--accent)',
   },

   daisyui: {
    themes: [
      {
        light: {
          "primary": "#cd3232",
          "secondary": "#e84a67",
          "accent": "#f25945",
          "neutral": "#2c2020",
          "base-100": "#ddd0d0",
        },
        dark: {
          "primary": "#cd3232",
          "secondary": "#b51734",
          "accent": "#ba210d",
          "neutral": "#2c2020",
          "base-100": "#2f2222",
        },
      },
    ],
  },
}

