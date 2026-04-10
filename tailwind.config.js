/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0D0D0F',
        surface: '#111114',
        card: '#18181C',
        border: '#2A2A30',
        accent: '#5B6AF0',
        'accent-glow': '#7B8AF8',
        muted: '#6B6B7A',
        text: '#E8E8EE',
        'text-dim': '#9898A8',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
