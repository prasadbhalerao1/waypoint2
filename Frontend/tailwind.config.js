/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'wp-primary': 'var(--wp-primary)',
        'wp-accent': 'var(--wp-accent)',
        'wp-bg': 'var(--wp-bg)',
        'wp-surface': 'var(--wp-surface)',
        'wp-text': 'var(--wp-text)',
        'wp-muted': 'var(--wp-muted)',
        'wp-gradient-start': 'var(--wp-gradient-start)',
        'wp-gradient-end': 'var(--wp-gradient-end)',
      },
    },
  },
  plugins: [],
};
