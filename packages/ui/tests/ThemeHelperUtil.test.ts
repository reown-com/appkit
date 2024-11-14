import { describe, expect, it } from 'vitest'
import { ThemeHelperUtil } from '../src/utils/ThemeHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('ThemeHelperUtil', () => {
  it('should convert string to kebab case string', () => {
    expect(ThemeHelperUtil.toKebabCase('backgroundColor')).toStrictEqual('background-color')
    expect(ThemeHelperUtil.toKebabCase('borderRadius')).toStrictEqual('border-radius')
    expect(ThemeHelperUtil.toKebabCase('padding50')).toStrictEqual('padding-50')
    expect(ThemeHelperUtil.toKebabCase('marginLeft50')).toStrictEqual('margin-left-50')
  })

  it('should generate rgba colors based on configuration', () => {
    expect(
      ThemeHelperUtil.generateRgbaColors({ rgb: '9, 136, 240', name: 'accent' })
    ).toStrictEqual({
      accent010: 'rgba(9, 136, 240, 0.1)',
      accent020: 'rgba(9, 136, 240, 0.2)',
      accent030: 'rgba(9, 136, 240, 0.3)',
      accent040: 'rgba(9, 136, 240, 0.4)',
      accent050: 'rgba(9, 136, 240, 0.5)',
      accent060: 'rgba(9, 136, 240, 0.6)',
      accent070: 'rgba(9, 136, 240, 0.7)',
      accent080: 'rgba(9, 136, 240, 0.8)',
      accent090: 'rgba(9, 136, 240, 0.9)',
      accent100: 'rgba(9, 136, 240, 1)'
    })
    expect(
      ThemeHelperUtil.generateRgbaColors({ rgb: '9, 136, 240', name: 'neutrals', start: 4, end: 6 })
    ).toStrictEqual({
      neutrals040: 'rgba(9, 136, 240, 0.4)',
      neutrals050: 'rgba(9, 136, 240, 0.5)',
      neutrals060: 'rgba(9, 136, 240, 0.6)'
    })
    expect(
      ThemeHelperUtil.generateRgbaColors({
        rgb: '9, 136, 240',
        name: 'accentSecondary',
        start: 1,
        end: 3,
        multiplier: 2
      })
    ).toStrictEqual({
      accentSecondary020: 'rgba(9, 136, 240, 0.2)',
      accentSecondary040: 'rgba(9, 136, 240, 0.4)',
      accentSecondary060: 'rgba(9, 136, 240, 0.6)'
    })
    expect(
      ThemeHelperUtil.generateRgbaColors({
        rgb: '9, 136, 240',
        name: 'accentSecondary',
        start: 2,
        end: 4,
        multiplier: 2
      })
    ).toStrictEqual({
      accentSecondary040: 'rgba(9, 136, 240, 0.4)',
      accentSecondary060: 'rgba(9, 136, 240, 0.6)',
      accentSecondary080: 'rgba(9, 136, 240, 0.8)'
    })
  })

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
      background: '--apkt--background',
      theme: {
        dark: {
          accent: '--apkt--theme-dark-accent'
        },
        light: {
          accent: '--apkt--theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: undefined }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt--theme-dark-accent'
        },
        light: {
          accent: '--apkt--theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt--theme-dark-accent'
        },
        light: {
          accent: '--apkt--theme-light-accent'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariables
    ).toStrictEqual({
      theme: {
        dark: {
          accent: '--apkt--theme-dark-accent'
        },
        light: {
          accent: '--apkt--theme-light-accent'
        }
      }
    })

    expect(ThemeHelperUtil.createCSSVariables(styles).cssVariablesVarPrefix).toStrictEqual({
      background: 'var(--apkt--background)',
      theme: {
        dark: {
          accent: 'var(--apkt--theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt--theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: undefined }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt--theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt--theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt--theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt--theme-light-accent)'
        }
      }
    })
    expect(
      ThemeHelperUtil.createCSSVariables({ ...styles, background: {} }).cssVariablesVarPrefix
    ).toStrictEqual({
      theme: {
        dark: {
          accent: 'var(--apkt--theme-dark-accent)'
        },
        light: {
          accent: 'var(--apkt--theme-light-accent)'
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
      '--apkt--background': styles.background,
      '--apkt--theme-dark-accent': styles.theme.dark.accent,
      '--apkt--theme-light-accent': styles.theme.light.accent
    })
    expect(
      ThemeHelperUtil.assignCSSVariables(cssVariables, { ...styles, background: undefined })
    ).toStrictEqual({
      '--apkt--theme-dark-accent': styles.theme.dark.accent,
      '--apkt--theme-light-accent': styles.theme.light.accent
    })
    expect(
      ThemeHelperUtil.assignCSSVariables(cssVariables, { ...styles, background: undefined })
    ).toStrictEqual({
      '--apkt--theme-dark-accent': styles.theme.dark.accent,
      '--apkt--theme-light-accent': styles.theme.light.accent
    })
  })
})
