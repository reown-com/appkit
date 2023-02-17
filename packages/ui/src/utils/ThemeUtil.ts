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
      overlay: 'rgba(255,255,255,0.1'
    }
  }
}

export const ThemeUtil = {
  color() {
    const themeMode = ThemeCtrl.state.themeMode ?? 'dark'
    const theme = themeModeColors()[themeMode]

    return {
      foreground: {
        ...theme.foreground
      },
      background: {
        ...theme.background
      },
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

        '--w3m-accent-color-inverse': theme?.['--w3m-accent-color-inverse'] ?? '#FFFFFF',

        '--w3m-z-index': theme?.['--w3m-z-index'] ?? '89',

        '--w3m-success-color': 'rgb(38,181,98)',

        '--w3m-error-color': 'rgb(242, 90, 103)',

        '--w3m-gradient-1': '#B6B9C9',

        '--w3m-gradient-2': '#C653C6',

        '--w3m-gradient-3': '#794DFF',

        '--w3m-gradient-4': '#2EB8B8',

        '--w3m-background-color': theme?.['--w3m-background-color'] ?? '#3396FF',

        '--w3m-background-image-url': theme?.['--w3m-background-image-url']
          ? `url(${theme?.['--w3m-background-image-url']})`
          : 'none',

        // Old
        '--w3m-color-fg-1': ThemeUtil.color().foreground[1],
        '--w3m-color-fg-2': ThemeUtil.color().foreground[2],
        '--w3m-color-fg-3': ThemeUtil.color().foreground[3],
        '--w3m-color-bg-1': ThemeUtil.color().background[1],
        '--w3m-color-bg-2': ThemeUtil.color().background[2],
        '--w3m-color-bg-3': ThemeUtil.color().background[3],
        '--w3m-color-overlay': ThemeUtil.color().overlay
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
      color: var(--w3m-accent-color-inverse);
      background: var(--w3m-accent-color);
    }
  `
}
