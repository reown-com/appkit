module.exports = {
  // ... other config
  extend: {
    keyframes: {
      pop: {
        '0%': { transform: 'scale(1)', boxShadow: 'var(--box-shadow)' },
        '100%': { transform: 'scale(var(--scale))', boxShadow: 'var(--box-shadow-picked-up)' }
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      }
    },
    animation: {
      pop: 'pop 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      fadeIn: 'fadeIn 500ms ease'
    }
  }
}
