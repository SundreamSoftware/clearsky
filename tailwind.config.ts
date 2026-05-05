import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#00D9C0',
        'brand-hover': '#00c4ad',
      },
    },
  },
  plugins: [forms],
} satisfies Config;

