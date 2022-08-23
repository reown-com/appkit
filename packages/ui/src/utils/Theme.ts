import { ConfigType } from '@web3modal/core'
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
`

export const fonts = css`
  .w3m-font {
    font-style: normal;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu,
      'Helvetica Neue', sans-serif;
    font-feature-settings: 'case' on;
  }

  .w3m-font-xxsmall-bold {
    font-weight: 700;
    font-size: 10px;
    line-height: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .w3m-font-xsmall-normal {
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    letter-spacing: -0.03em;
  }

  .w3m-font-small-thin {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.03em;
  }

  .w3m-font-small-bold {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-thin {
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-normal {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-bold {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-large-bold {
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: -0.03em;
  }
`

export function colorPresets(a: number) {
  return {
    default: {
      light: {
        foreground: `rgba(198,83,128,${a})`,
        background: `rgba(244,221,230,${a})`
      },
      dark: {
        foreground: `rgba(203,77,140,${a})`,
        background: `rgba(57,35,43,${a})`
      }
    },

    magenta: {
      light: {
        foreground: `rgba(198,83,128,${a})`,
        background: `rgba(244,221,230,${a})`
      },
      dark: {
        foreground: `rgba(203,77,140,${a})`,
        background: `rgba(57,35,43,${a})`
      }
    },

    blue: {
      light: {
        foreground: `rgba(61,92,245,${a})`,
        background: `rgba(232,235,252,${a})`
      },
      dark: {
        foreground: `rgba(81,109,251,${a})`,
        background: `rgba(28,33,59,${a})`
      }
    },

    orange: {
      light: {
        foreground: `rgba(234,140,46,${a})`,
        background: `rgba(244,236,221,${a})`
      },
      dark: {
        foreground: `rgba(255,166,76,${a})`,
        background: `rgba(57,50,34,${a})`
      }
    },

    green: {
      light: {
        foreground: `rgba(38,181,98,${a})`,
        background: `rgba(218,246,218,${a})`
      },
      dark: {
        foreground: `rgba(38,217,98,${a})`,
        background: `rgba(35,52,40,${a})`
      }
    },

    purple: {
      light: {
        foreground: `rgba(121,76,255,${a})`,
        background: `rgba(225,218,246,${a})`
      },
      dark: {
        foreground: `rgba(144,110,247,${a})`,
        background: `rgba(36,31,51,${a})`
      }
    },

    teal: {
      light: {
        foreground: `rgba(43,182,182,${a})`,
        background: `rgba(217,242,238,${a})`
      },
      dark: {
        foreground: `rgba(54,226,226,${a})`,
        background: `rgba(29,48,52,${a})`
      }
    },

    blackWhite: {
      light: {
        foreground: `rgba(20,20,20,${a})`,
        background: `rgba(255,255,255,${a})`
      },
      dark: {
        foreground: `rgba(255,255,255,${a})`,
        background: `rgba(20,20,20,${a})`
      }
    }
  }
}

interface ColorArgs {
  alpha?: number
  accentColor?: ConfigType['accentColor']
}
export function color(args?: ColorArgs) {
  const a = args?.alpha ?? 1

  return {
    light: {
      foreground: {
        accent: `rgba(51,150,255,${a})`,
        inverse: `rgba(255,255,255,${a})`,
        1: `rgba(20,20,20,${a})`,
        2: `rgba(121,134,134,${a})`,
        3: `rgba(158,169,169,${a})`
      },
      background: {
        accent: `rgba(232,242,252,${a})`,
        1: `rgba(255,255,255,${a})`,
        2: `rgba(241,243,243,${a})`,
        3: `rgba(228,231,231,${a})`
      },
      overlay: {
        thin: 'rgba(0,0,0,0.1)',
        thick: 'rgba(0,0,0,0.4)'
      }
    },

    dark: {
      foreground: {
        accent: `rgba(71,161,255,${a})`,
        inverse: `rgba(255,255,255,${a})`,
        1: `rgba(228,231,231,${a})`,
        2: `rgba(148,158,158,${a})`,
        3: `rgba(110,119,119,${a})`
      },
      background: {
        accent: `rgba(21,38,55,${a})`,
        1: `rgba(20,20,20,${a})`,
        2: `rgba(39,42,42,${a})`,
        3: `rgba(59,64,64,${a})`
      },
      overlay: {
        thin: 'rgba(255,255,255,0.1)',
        thick: 'rgba(255,255,255,0.4)'
      }
    }
  }
}
