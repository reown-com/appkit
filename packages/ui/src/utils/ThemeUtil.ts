import { ThemeCtrl } from '@web3modal/core'
import { css } from 'lit'

function themeModeVariables() {
  const themeMode = ThemeCtrl.state.themeMode ?? 'dark'
  const themeModePresets = {
    light: {
      foreground: { 1: `rgb(20,20,20)`, 2: `rgb(121,134,134)`, 3: `rgb(158,169,169)` },
      background: { 1: `rgb(255,255,255)`, 2: `rgb(241,243,243)`, 3: `rgb(228,231,231)` },
      overlay: 'rgba(0,0,0,0.1)'
    },
    dark: {
      foreground: { 1: `rgb(228,231,231)`, 2: `rgb(148,158,158)`, 3: `rgb(110,119,119)` },
      background: { 1: `rgb(20,20,20)`, 2: `rgb(39,42,42)`, 3: `rgb(59,64,64)` },
      overlay: 'rgba(255,255,255,0.1)'
    }
  }
  const themeModeColors = themeModePresets[themeMode]

  return {
    '--w3m-color-fg-1': themeModeColors.foreground[1],
    '--w3m-color-fg-2': themeModeColors.foreground[2],
    '--w3m-color-fg-3': themeModeColors.foreground[3],
    '--w3m-color-bg-1': themeModeColors.background[1],
    '--w3m-color-bg-2': themeModeColors.background[2],
    '--w3m-color-bg-3': themeModeColors.background[3],
    '--w3m-color-overlay': themeModeColors.overlay
  }
}

function themeVariablesPresets() {
  return {
    '--w3m-accent-color': '#3396FF',
    '--w3m-accent-fill-color': '#FFFFFF',
    '--w3m-z-index': '89',
    '--w3m-background-color': '#3396FF',
    '--w3m-background-border-radius': '8px',
    '--w3m-container-border-radius': '30px',
    '--w3m-wallet-icon-border-radius': '15px',
    '--w3m-wallet-icon-large-border-radius': '30px',
    '--w3m-wallet-icon-small-border-radius': '7px',
    '--w3m-input-border-radius': '28px',
    '--w3m-button-border-radius': '10px',
    '--w3m-notification-border-radius': '36px',
    '--w3m-secondary-button-border-radius': '28px',
    '--w3m-icon-button-border-radius': '50%',
    '--w3m-button-hover-highlight-border-radius': '10px',
    '--w3m-text-big-bold-size': '20px',
    '--w3m-text-big-bold-weight': '600',
    '--w3m-text-big-bold-line-height': '24px',
    '--w3m-text-big-bold-letter-spacing': '-0.03em',
    '--w3m-text-big-bold-text-transform': 'none',
    '--w3m-text-xsmall-bold-size': '10px',
    '--w3m-text-xsmall-bold-weight': '700',
    '--w3m-text-xsmall-bold-line-height': '12px',
    '--w3m-text-xsmall-bold-letter-spacing': '0.02em',
    '--w3m-text-xsmall-bold-text-transform': 'uppercase',
    '--w3m-text-xsmall-regular-size': '12px',
    '--w3m-text-xsmall-regular-weight': '600',
    '--w3m-text-xsmall-regular-line-height': '14px',
    '--w3m-text-xsmall-regular-letter-spacing': '-0.03em',
    '--w3m-text-xsmall-regular-text-transform': 'none',
    '--w3m-text-small-thin-size': '14px',
    '--w3m-text-small-thin-weight': '500',
    '--w3m-text-small-thin-line-height': '16px',
    '--w3m-text-small-thin-letter-spacing': '-0.03em',
    '--w3m-text-small-thin-text-transform': 'none',
    '--w3m-text-small-regular-size': '14px',
    '--w3m-text-small-regular-weight': '600',
    '--w3m-text-small-regular-line-height': '16px',
    '--w3m-text-small-regular-letter-spacing': '-0.03em',
    '--w3m-text-small-regular-text-transform': 'none',
    '--w3m-text-medium-regular-size': '16px',
    '--w3m-text-medium-regular-weight': '600',
    '--w3m-text-medium-regular-line-height': '20px',
    '--w3m-text-medium-regular-letter-spacing': '-0.03em',
    '--w3m-text-medium-regular-text-transform': 'none',
    '--w3m-font-family':
      "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif",
    '--w3m-font-feature-settings': `'tnum' on, 'lnum' on, 'case' on`,
    '--w3m-success-color': 'rgb(38,181,98)',
    '--w3m-error-color': 'rgb(242, 90, 103)',
    '--w3m-overlay-background-color': 'rgba(0, 0, 0, 0.3)',
    '--w3m-overlay-backdrop-filter': 'none'
  }
}

function themeBackgroundImage() {
  const { themeVariables } = ThemeCtrl.state
  const backgroundImageUrl = themeVariables?.['--w3m-background-image-url']
    ? `url(${themeVariables['--w3m-background-image-url']})`
    : 'none'

  return {
    '--w3m-background-image-url': backgroundImageUrl
  }
}

export const ThemeUtil = {
  getPreset(key: string) {
    return themeVariablesPresets()[key as never]
  },

  setTheme() {
    const root: HTMLElement | null = document.querySelector(':root')
    const { themeVariables } = ThemeCtrl.state

    if (root) {
      const variables = {
        ...themeModeVariables(),
        ...themeVariablesPresets(),
        ...themeVariables,
        ...themeBackgroundImage()
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
      transition: all 0.2s ease;
    }

    @media (hover: hover) and (pointer: fine) {
      button:active {
        transition: all 0.1s ease;
        transform: scale(0.93);
      }
    }

    button::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      transition:
        background-color,
        0.2s ease;
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
