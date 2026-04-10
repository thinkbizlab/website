import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple:  '#7C3AED',
        indigo:  '#1E1B4B',
        accent:  '#A78BFA',
        lavend:  '#EDE9FE',
        tborder: '#DDD6FE',
        muted:   '#9B8EC4',
        dark:    '#0F0D1A',
        dim:     '#2D1B5E',
        midp:    '#5B21B6',
      },
      fontFamily: {
        heading: ['var(--font-prompt)', 'sans-serif'],
        body:    ['var(--font-sarabun)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
