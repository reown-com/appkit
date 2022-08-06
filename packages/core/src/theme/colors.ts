export default function color(alpha = 1) {
  return {
    light: {
      foreground: {
        accent: `rgba(51,150,255,${alpha})`,
        inverse: `rgba(255,255,255,${alpha})`,
        1: `rgba(20,20,20,${alpha})`,
        2: `rgba(121,134,134,${alpha})`,
        3: `rgba(158,169,169,${alpha})`
      },
      background: {
        accent: `rgba(232,242,252,${alpha})`,
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
        accent: `rgba(71,161,255,${alpha})`,
        inverse: `rgba(255,255,255,${alpha})`,
        1: `rgba(228,231,231,${alpha})`,
        2: `rgba(148,158,158,${alpha})`,
        3: `rgba(110,119,119,${alpha})`
      },
      background: {
        accent: `rgba(21,38,55,${alpha})`,
        1: `rgba(20,20,20,${alpha})`,
        2: `rgba(39,42,42,${alpha})`,
        3: `rgba(59,64,64,${alpha})`
      },
      overlay: {
        thin: 'rgba(255,255,255,0.1)',
        thick: 'rgba(255,255,255,0.4)'
      }
    },

    magenta: {
      light: {
        foreground: `rgba(198,83,128,${alpha})`,
        background: `rgba(244,221,230,${alpha})`
      },
      dark: {
        foreground: `rgba(203,77,140,${alpha})`,
        background: `rgba(57,35,43,${alpha})`
      }
    },

    blue: {
      light: {
        foreground: `rgba(61,92,245,${alpha})`,
        background: `rgba(232,235,252,${alpha})`
      },
      dark: {
        foreground: `rgba(81,109,251,${alpha})`,
        background: `rgba(28,33,59,${alpha})`
      }
    },

    orange: {
      light: {
        foreground: `rgba(234,140,46,${alpha})`,
        background: `rgba(244,236,221,${alpha})`
      },
      dark: {
        foreground: `rgba(255,166,76,${alpha})`,
        background: `rgba(57,50,34,${alpha})`
      }
    },

    green: {
      light: {
        foreground: `rgba(38,181,98,${alpha})`,
        background: `rgba(218,246,218,${alpha})`
      },
      dark: {
        foreground: `rgba(38,217,98,${alpha})`,
        background: `rgba(35,52,40,${alpha})`
      }
    },

    purple: {
      light: {
        foreground: `rgba(121,76,255,${alpha})`,
        background: `rgba(225,218,246,${alpha})`
      },
      dark: {
        foreground: `rgba(144,110,247,${alpha})`,
        background: `rgba(36,31,51,${alpha})`
      }
    },

    teal: {
      light: {
        foreground: `rgba(43,182,182,${alpha})`,
        background: `rgba(217,242,238,${alpha})`
      },
      dark: {
        foreground: `rgba(54,226,226,${alpha})`,
        background: `rgba(29,48,52,${alpha})`
      }
    },

    blackWhite: {
      light: {
        foreground: `rgba(20,20,20,${alpha})`,
        background: `rgba(255,255,255,${alpha})`
      },
      dark: {
        foreground: `rgba(255,255,255,${alpha})`,
        background: `rgba(20,20,20,${alpha})`
      }
    }
  }
}
