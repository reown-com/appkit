import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontSize: {
      sm: ['0.75rem', { lineHeight: '0.875rem', letterSpacing: '-0.01em' }],
      md: ['0.875rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],
      lg: ['1rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em' }],
      h6: ['1.25rem', { lineHeight: '1.25rem', letterSpacing: '-0.03em' }],
      h5: ['1.625rem', { lineHeight: '1.625rem', letterSpacing: '-0.01em' }],
      h4: ['2rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
      h3: ['2.375rem', { lineHeight: '2.375rem', letterSpacing: '-0.02em' }],
      h2: ['2.75rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
      h1: ['3.125rem', { lineHeight: '3.125rem', letterSpacing: '-0.02em' }],

      'sm-mono': ['0.75rem', { lineHeight: '0.75rem', letterSpacing: '-0.06em' }],
      'md-mono': ['0.875rem', { lineHeight: '0.875rem', letterSpacing: '-0.06em' }],
      'lg-mono': ['1rem', { lineHeight: '1rem', letterSpacing: '-0.06em' }],
      'h6-mono': ['1.25rem', { lineHeight: '1.25rem', letterSpacing: '-0.06em' }],
      'h5-mono': ['1.625rem', { lineHeight: '1.625rem', letterSpacing: '-0.06em' }],
      'h4-mono': ['2rem', { lineHeight: '2rem', letterSpacing: '-0.06em' }],
      'h3-mono': ['2.375rem', { lineHeight: '2.375rem', letterSpacing: '-0.06em' }],
      'h2-mono': ['2.75rem', { lineHeight: '2.75rem', letterSpacing: '-0.06em' }],
      'h1-mono': ['3.125rem', { lineHeight: '3.125rem', letterSpacing: '-0.06em' }]
    },

    borderRadius: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '3rem',
      12: '3.5rem',
      13: '4rem',
      full: '9999px'
    },

    colors: {
      transparent: 'transparent',
      main: 'hsl(var(--main))',
      white: 'hsl(var(--white))',

      gray: {
        50: 'hsl(var(--gray-50))',
        100: 'hsl(var(--gray-100))',
        200: 'hsl(var(--gray-200))',
        300: 'hsl(var(--gray-300))',
        400: 'hsl(var(--gray-400))',
        500: 'hsl(var(--gray-500))',
        600: 'hsl(var(--gray-600))',
        700: 'hsl(var(--gray-700))',
        800: 'hsl(var(--gray-800))',
        900: 'hsl(var(--gray-900))',
        1000: 'hsl(var(--gray-1000))'
      },

      foreground: {
        primary: 'hsl(var(--foreground-primary))',
        secondary: 'hsl(var(--foreground-secondary))',
        tertiary: 'hsl(var(--foreground-tertiary))',
        accent: {
          10: 'hsl(var(--foreground-accent), 0.1)',
          40: 'hsl(var(--foreground-accent), 0.4)',
          60: 'hsl(var(--foreground-accent), 0.6)',
          secondary: {
            10: 'hsl(var(--foreground-accent-secondary), 0.1)',
            40: 'hsl(var(--foreground-accent-secondary), 0.4)',
            60: 'hsl(var(--foreground-accent-secondary), 0.6)'
          }
        }
      },

      icon: {
        primary: 'hsl(var(--icon-primary))',
        inverse: 'hsl(var(--icon-inverse))'
      },

      accent: 'hsl(var(--accent), <alpha-value>)',
      'accent-secondary': 'hsl(var(--accent-secondary), <alpha-value>)',
      success: 'hsl(var(--success), <alpha-value>)',
      error: 'hsl(var(--error), <alpha-value>)',
      warning: 'hsl(var(--warning), <alpha-value>)',

      walletkit: '#FFB800',
      appkit: '#FF573B',
      dashboard: '#0988F0',
      docs: '#008847',
      premium: '#FFD700'
    },

    extend: {
      spacing: {
        '1.5': '0.375rem'
      },

      textColor: {
        primary: 'hsl(var(--text-primary))',
        secondary: 'hsl(var(--text-secondary))',
        tertiary: 'hsl(var(--text-tertiary))',
        inverse: 'hsl(var(--text-inverse))'
      },

      backgroundColor: {
        primary: 'hsl(var(--bg-primary))',
        inverse: 'hsl(var(--bg-inverse))',
        border: 'hsl(var(--border-primary))'
      },

      backgroundImage: {
        'fade-top-foreground-primary': `linear-gradient(to bottom, theme(colors.foreground.primary) 30%, transparent)`,
        'fade-bottom-foreground-primary': `linear-gradient(to top, theme(colors.foreground.primary) 30%, transparent)`
      },

      borderColor: {
        primary: 'hsl(var(--border-primary))',
        secondary: 'hsl(var(--border-secondary))'
      },

      boxShadowColor: {
        primary: 'hsl(var(--border-primary))',
        secondary: 'hsl(var(--border-secondary))'
      },

      animation: {
        'spin-fast': 'spin 0.75s linear infinite'
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')]
}

export default config
