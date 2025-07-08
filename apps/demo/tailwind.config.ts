import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--apkt-background-primary))',
          invert: 'hsl(var(--apkt-background-invert))',
          'accent-primary': 'hsl(var(--apkt-background-accent-primary))'
        },
        fg: {
          accent: 'hsl(var(--apkt-foreground-accent))',
          primary: 'hsl(var(--apkt-foreground-primary))',
          secondary: 'hsl(var(--apkt-foreground-secondary))',
          tertiary: 'hsl(var(--apkt-foreground-tertiary))'
        },
        border: {
          DEFAULT: 'hsl(var(--apkt-border))',
          secondary: 'hsl(var(--apkt-border-secondary))',
          accent: 'hsl(var(--apkt-border-accent))',
          'accent-certified': 'hsl(var(--apkt-border-accent-certified))',
          success: 'hsl(var(--apkt-border-success))',
          error: 'hsl(var(--apkt-border-error))',
          warning: 'hsl(var(--apkt-border-warning))'
        },
        text: {
          primary: 'hsl(var(--apkt-text-primary))',
          secondary: 'hsl(var(--apkt-text-secondary))',
          tertiary: 'hsl(var(--apkt-text-tertiary))',
          invert: 'hsl(var(--apkt-text-invert))'
        },

        // ---- Shadcn Variables
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      height: {
        '9.5': '2.375rem'
      },
      borderRadius: {
        sm: 'var(--apkt-border-sm)',
        md: 'var(--apkt-border-md)',
        lg: 'var(--apkt-border-lg)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
export default config
