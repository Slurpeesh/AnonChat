import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        'background-section':
          'hsl(var(--color-background-section) / <alpha-value>)',
        'accent-mild': 'hsl(var(--color-accent-mild) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-hover': 'hsl(var(--color-accent-hover) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        alert: 'hsl(var(--color-alert) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config
