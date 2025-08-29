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

  it('should handle z-index values correctly in generateW3MVariables and generateW3MOverrides', () => {
    const themeVariablesWithZIndex = {
      '--w3m-z-index': 999
    }

    const customZIndexResult = ThemeHelperUtil.generateW3MVariables(themeVariablesWithZIndex)
    expect(customZIndexResult['--apkt-z-index']).toBe('999')

    const customZIndexOverrides = ThemeHelperUtil.generateW3MOverrides(themeVariablesWithZIndex)
    expect(customZIndexOverrides['--apkt-tokens-core-zIndex']).toBe('999')

    const themeVariablesWithoutZIndex = {
      '--w3m-accent': '#ff0000'
    }

    const defaultZIndexResult = ThemeHelperUtil.generateW3MVariables(themeVariablesWithoutZIndex)
    expect(defaultZIndexResult['--apkt-z-index']).toBe('0')

    const defaultZIndexOverrides = ThemeHelperUtil.generateW3MOverrides(themeVariablesWithoutZIndex)
    expect(defaultZIndexOverrides['--apkt-tokens-core-zIndex']).toBeUndefined()

    const undefinedResult = ThemeHelperUtil.generateW3MVariables(undefined)
    expect(undefinedResult).toStrictEqual({})

    const undefinedOverrides = ThemeHelperUtil.generateW3MOverrides(undefined)
    expect(undefinedOverrides).toStrictEqual({})

    const emptyResult = ThemeHelperUtil.generateW3MVariables({})
    expect(emptyResult['--apkt-z-index']).toBe('0')

    const emptyOverrides = ThemeHelperUtil.generateW3MOverrides({})
    expect(emptyOverrides['--apkt-tokens-core-zIndex']).toBeUndefined()
  })
})
