import { ConfigCtrl } from '@web3modal/core'
import { css } from 'lit'

export const global = css`
  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
  }

  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: none;
  }

  button::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
    transition: background-color, 0.2s ease-in-out;
  }

  button:disabled {
    cursor: not-allowed;
  }

  button svg,
  button w3m-text {
    position: relative;
    z-index: 1;
  }
`

export function accentColors(a: number) {
  return {
    default: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(51,150,255,${a})`,
        background: `rgba(232,242,252,${a})`
      },
      dark: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(71,161,255,${a})`,
        background: `rgba(21,38,55,${a})`
      }
    },

    magenta: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(198,83,128,${a})`,
        background: `rgba(244,221,230,${a})`
      },
      dark: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(203,77,140,${a})`,
        background: `rgba(57,35,43,${a})`
      }
    },

    blue: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(61,92,245,${a})`,
        background: `rgba(232,235,252,${a})`
      },
      dark: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(81,109,251,${a})`,
        background: `rgba(28,33,59,${a})`
      }
    },

    orange: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(234,140,46,${a})`,
        background: `rgba(244,236,221,${a})`
      },
      dark: {
        inverse: `rgba(0,0,0,${a})`,
        foreground: `rgba(255,166,76,${a})`,
        background: `rgba(57,50,34,${a})`
      }
    },

    green: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(38,181,98,${a})`,
        background: `rgba(218,246,218,${a})`
      },
      dark: {
        inverse: `rgba(0,0,0,${a})`,
        foreground: `rgba(38,217,98,${a})`,
        background: `rgba(35,52,40,${a})`
      }
    },

    purple: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(121,76,255,${a})`,
        background: `rgba(225,218,246,${a})`
      },
      dark: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(144,110,247,${a})`,
        background: `rgba(36,31,51,${a})`
      }
    },

    teal: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(43,182,182,${a})`,
        background: `rgba(217,242,238,${a})`
      },
      dark: {
        inverse: `rgba(0,0,0,${a})`,
        foreground: `rgba(54,226,226,${a})`,
        background: `rgba(29,48,52,${a})`
      }
    },

    blackWhite: {
      light: {
        inverse: `rgba(255,255,255,${a})`,
        foreground: `rgba(20,20,20,${a})`,
        background: `rgba(255,255,255,${a})`
      },
      dark: {
        inverse: `rgba(0,0,0,${a})`,
        foreground: `rgba(255,255,255,${a})`,
        background: `rgba(20,20,20,${a})`
      }
    }
  }
}

export function themeColors(alpha: number) {
  return {
    light: {
      foreground: {
        1: `rgba(20,20,20,${alpha})`,
        2: `rgba(121,134,134,${alpha})`,
        3: `rgba(158,169,169,${alpha})`
      },
      background: {
        1: `rgba(255,255,255,${alpha})`,
        2: `rgba(241,243,243,${alpha})`,
        3: `rgba(228,231,231,${alpha})`
      },
      overlay: {
        thin: 'rgba(0,0,0,0.1)',
        thick: 'rgba(0,0,0,0.4)'
      }
    },

    dark: {
      foreground: {
        1: `rgba(228,231,231,${alpha})`,
        2: `rgba(148,158,158,${alpha})`,
        3: `rgba(110,119,119,${alpha})`
      },
      background: {
        1: `rgba(20,20,20,${alpha})`,
        2: `rgba(39,42,42,${alpha})`,
        3: `rgba(59,64,64,${alpha})`
      },
      overlay: {
        thin: 'rgba(255,255,255,0.1)',
        thick: 'rgba(255,255,255,0.4)'
      }
    }
  }
}

export function color(alpha = 1) {
  const accentPreset = ConfigCtrl.state.accentColor ?? 'default'
  const themePreset = ConfigCtrl.state.theme ?? 'dark'
  const accent = accentColors(alpha)[accentPreset][themePreset]
  const theme = themeColors(alpha)[themePreset]

  return {
    foreground: {
      accent: accent.foreground,
      inverse: accent.inverse,
      ...theme.foreground
    },
    background: {
      accent: accent.background,
      ...theme.background
    },
    overlay: { ...theme.overlay }
  }
}
