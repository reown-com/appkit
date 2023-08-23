import { describe, expect, it } from 'vitest'
import { ThemeController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('ThemeController', () => {
  it('should have valid default state', () => {
    expect(ThemeController.state).toEqual({
      themeMode: 'dark',
      themeVariables: {}
    })
  })

  it('should update state correctly when changing theme', () => {
    ThemeController.setThemeMode('light')
    expect(ThemeController.state).toEqual({
      themeMode: 'light',
      themeVariables: {}
    })
  })

  it('should update state correctly when changing themeVariables', () => {
    ThemeController.setThemeVariables({ '--w3m-color-mix': '#FF0000' })
    expect(ThemeController.state).toEqual({
      themeMode: 'light',
      themeVariables: { '--w3m-color-mix': '#FF0000' }
    })
  })
})
