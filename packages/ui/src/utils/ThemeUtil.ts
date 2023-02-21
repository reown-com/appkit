import { ThemeCtrl } from '@web3modal/core'
import { css } from 'lit'

function themeModeColors() {
  return {
    light: {
      foreground: {
        1: `rgb(20,20,20)`,
        2: `rgb(121,134,134)`,
        3: `rgb(158,169,169)`
      },
      background: {
        1: `rgb(255,255,255)`,
        2: `rgb(241,243,243)`,
        3: `rgb(228,231,231)`
      },
      overlay: 'rgba(0,0,0,0.1)'
    },

    dark: {
      foreground: {
        1: `rgb(228,231,231)`,
        2: `rgb(148,158,158)`,
        3: `rgb(110,119,119)`
      },
      background: {
        1: `rgb(20,20,20)`,
        2: `rgb(39,42,42)`,
        3: `rgb(59,64,64)`
      },
      overlay: 'rgba(255,255,255,0.1)'
    }
  }
}

export const ThemeUtil = {
  color() {
    const themeMode = ThemeCtrl.state.themeMode ?? 'dark'
    const theme = themeModeColors()[themeMode]

    return {
      foreground: { ...theme.foreground },
      background: { ...theme.background },
      overlay: theme.overlay,
      error: `rgb(242, 90, 103)`
    }
  },

  setTheme() {
    const root: HTMLElement | null = document.querySelector(':root')
    const theme = ThemeCtrl.state.themeVariables

    if (root) {
      const variables = {
        '--w3m-accent-color': theme?.['--w3m-accent-color'] ?? '#3396FF',

        '--w3m-accent-fill-color': theme?.['--w3m-accent-fill-color'] ?? '#FFFFFF',

        '--w3m-z-index': theme?.['--w3m-z-index'] ?? '89',

        '--w3m-background-color': theme?.['--w3m-background-color'] ?? '#3396FF',

        '--w3m-background-image-url': theme?.['--w3m-background-image-url']
          ? `url(${theme['--w3m-background-image-url']})`
          : 'none',

        '--w3m-background-border-radius': theme?.['--w3m-background-border-radius'] ?? '8px',

        '--w3m-container-border-radius': theme?.['--w3m-container-border-radius'] ?? '30px',

        '--w3m-wallet-icon-border-radius': theme?.['--w3m-wallet-icon-border-radius'] ?? '15px',

        '--w3m-input-border-radius': theme?.['--w3m-input-border-radius'] ?? '28px',

        '--w3m-button-border-radius': theme?.['--w3m-button-border-radius'] ?? '10px',

        '--w3m-notification-border-radius': theme?.['--w3m-notification-border-radius'] ?? '36px',

        '--w3m-secondary-button-border-radius':
          theme?.['--w3m-secondary-button-border-radius'] ?? '28px',

        '--w3m-icon-button-border-radius': theme?.['--w3m-icon-button-border-radius'] ?? '50%',

        '--w3m-button-hover-highlight-border-radius':
          theme?.['--w3m-button-hover-highlight-border-radius'] ?? '10px',

        '--w3m-font-family':
          theme?.['--w3m-font-family'] ??
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif",

        '--w3m-text-big-bold-size': theme?.['--w3m-text-big-bold-size'] ?? '20px',

        '--w3m-text-big-bold-weight': theme?.['--w3m-text-big-bold-weight'] ?? '600',

        '--w3m-text-big-bold-line-height': theme?.['--w3m-text-big-bold-line-height'] ?? '24px',

        '--w3m-text-big-bold-letter-spacing':
          theme?.['--w3m-text-big-bold-letter-spacing'] ?? '-0.03em',

        '--w3m-text-big-bold-text-transform':
          theme?.['--w3m-text-big-bold-text-transform'] ?? 'none',

        '--w3m-text-xsmall-bold-size': theme?.['--w3m-text-xsmall-bold-size'] ?? '10px',

        '--w3m-text-xsmall-bold-weight': theme?.['--w3m-text-xsmall-bold-weight'] ?? '700',

        '--w3m-text-xsmall-bold-line-height':
          theme?.['--w3m-text-xsmall-bold-line-height'] ?? '12px',

        '--w3m-text-xsmall-bold-letter-spacing':
          theme?.['--w3m-text-xsmall-bold-letter-spacing'] ?? '0.02em',

        '--w3m-text-xsmall-bold-text-transform':
          theme?.['--w3m-text-xsmall-bold-text-transform'] ?? 'uppercase',

        '--w3m-text-xsmall-regular-size': theme?.['--w3m-text-xsmall-regular-size'] ?? '12px',

        '--w3m-text-xsmall-regular-weight': theme?.['--w3m-text-xsmall-regular-weight'] ?? '600',

        '--w3m-text-xsmall-regular-line-height':
          theme?.['--w3m-text-xsmall-regular-line-height'] ?? '14px',

        '--w3m-text-xsmall-regular-letter-spacing':
          theme?.['--w3m-text-xsmall-regular-letter-spacing'] ?? '-0.03em',

        '--w3m-text-xsmall-regular-text-transform':
          theme?.['--w3m-text-xsmall-regular-text-transform'] ?? 'none',

        '--w3m-text-small-thin-size': theme?.['--w3m-text-small-thin-size'] ?? '14px',

        '--w3m-text-small-thin-weight': theme?.['--w3m-text-small-thin-weight'] ?? '500',

        '--w3m-text-small-thin-line-height': theme?.['--w3m-text-small-thin-line-height'] ?? '16px',

        '--w3m-text-small-thin-letter-spacing':
          theme?.['--w3m-text-small-thin-letter-spacing'] ?? '-0.03em',

        '--w3m-text-small-thin-text-transform':
          theme?.['--w3m-text-small-thin-text-transform'] ?? 'none',

        '--w3m-text-small-regular-size': theme?.['--w3m-text-small-regular-size'] ?? '14px',

        '--w3m-text-small-regular-weight': theme?.['--w3m-text-small-regular-weight'] ?? '600',

        '--w3m-text-small-regular-line-height':
          theme?.['--w3m-text-small-regular-line-height'] ?? '16px',

        '--w3m-text-small-regular-letter-spacing':
          theme?.['--w3m-text-small-regular-letter-spacing'] ?? '-0.03em',

        '--w3m-text-small-regular-text-transform':
          theme?.['--w3m-text-small-regular-text-transform'] ?? 'none',

        '--w3m-text-medium-regular-size': theme?.['--w3m-text-medium-regular-size'] ?? '16px',

        '--w3m-text-medium-regular-weight': theme?.['--w3m-text-medium-regular-weight'] ?? '600',

        '--w3m-text-medium-regular-line-height':
          theme?.['--w3m-text-medium-regular-line-height'] ?? '20px',

        '--w3m-text-medium-regular-letter-spacing':
          theme?.['--w3m-text-medium-regular-letter-spacing'] ?? '-0.03em',

        '--w3m-text-medium-regular-text-transform':
          theme?.['--w3m-text-medium-regular-text-transform'] ?? 'none',

        '--w3m-color-fg-1': ThemeUtil.color().foreground[1],
        '--w3m-color-fg-2': ThemeUtil.color().foreground[2],
        '--w3m-color-fg-3': ThemeUtil.color().foreground[3],
        '--w3m-color-bg-1': ThemeUtil.color().background[1],
        '--w3m-color-bg-2': ThemeUtil.color().background[2],
        '--w3m-color-bg-3': ThemeUtil.color().background[3],
        '--w3m-color-overlay': ThemeUtil.color().overlay,
        '--w3m-success-color': 'rgb(38,181,98)',
        '--w3m-error-color': 'rgb(242, 90, 103)',
        '--w3m-gradient-1': '#B6B9C9',
        '--w3m-gradient-2': '#C653C6',
        '--w3m-gradient-3': '#794DFF',
        '--w3m-gradient-4': '#2EB8B8'
      }

      Object.entries(variables).forEach(([key, val]) => root.style.setProperty(key, val))
    }
  },

  globalCss: css`
    *,
    *::after,
    *::before {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-style: normal;
      text-rendering: optimizeSpeed;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      backface-visibility: hidden;
    }

    button {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      border: none;
      background-color: transparent;
    }

    button::after {
      content: '';
      position: absolute;
      inset: 0;
      transition: background-color, 0.2s ease;
    }

    button:disabled {
      cursor: not-allowed;
    }

    button svg,
    button w3m-text {
      position: relative;
      z-index: 1;
    }

    input {
      border: none;
      outline: none;
      appearance: none;
    }

    img {
      display: block;
    }

    ::selection {
      color: var(--w3m-accent-fill-color);
      background: var(--w3m-accent-color);
    }
  `
}
