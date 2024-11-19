import { describe, expect, it } from 'vitest'
import { ThemeHelperUtil } from '../src/utils/ThemeHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('ThemeHelperUtil', () => {
  it('should create css variables for styles', () => {
    const styles = {
      background: 'red',
      theme: {
        dark: {
          accent: '#000'
        },
        light: {
          accent: '#fff'
        }
      }
    }

    expect(ThemeHelperUtil.createCSSVariables(styles).cssVariables).toStrictEqual({
      background: '--apkt-background',
      theme: {
        dark: {
          accent: '--apkt-theme-dark-accent'
        },
        light: {
          accent: '--apkt-theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: undefined }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt-theme-dark-accent'
        },
        light: {
          accent: '--apkt-theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt-theme-dark-accent'
        },
        light: {
          accent: '--apkt-theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt-theme-dark-accent'
        },
        light: {
          accent: '--apkt-theme-light-accent'
        }
      }
    })

    expect(ThemeHelperUtil.createCSSVariables(styles).cssVariablesVarPrefix).toStrictEqual({
      background: 'var(--apkt-background)',
      theme: {
        dark: {
          accent: 'var(--apkt-theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt-theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: undefined }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt-theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt-theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt-theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt-theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt-theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt-theme-light-accent)'
        }
      }
    })
  })

  it('should assign css variables based on style object', () => {
    const styles = {
      background: 'red',
      theme: {
        dark: {
          accent: '#000'
        },
        light: {
          accent: '#fff'
        }
      }
    }

    const { cssVariables } = ThemeHelperUtil.createCSSVariables(styles)

    expect(ThemeHelperUtil.assignCSSVariables(cssVariables, styles)).toStrictEqual({
      '--apkt-background': styles.background,
      '--apkt-theme-dark-accent': styles.theme.dark.accent,
      '--apkt-theme-light-accent': styles.theme.light.accent
    })
    expect(
      ThemeHelperUtil.assignCSSVariables(cssVariables, { ...styles, background: undefined })
    ).toStrictEqual({
      '--apkt-theme-dark-accent': styles.theme.dark.accent,
      '--apkt-theme-light-accent': styles.theme.light.accent
    })
    expect(
      ThemeHelperUtil.assignCSSVariables(cssVariables, { ...styles, background: undefined })
    ).toStrictEqual({
      '--apkt-theme-dark-accent': styles.theme.dark.accent,
      '--apkt-theme-light-accent': styles.theme.light.accent
    })
  })
})
