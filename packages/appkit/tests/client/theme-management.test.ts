import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiController, ThemeController } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Theme Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
  })

  it('should get theme mode', () => {
    vi.spyOn(ThemeController.state, 'themeMode', 'get').mockReturnValueOnce('dark')

    const appKit = new AppKit(mockOptions)

    expect(appKit.getThemeMode()).toBe('dark')
  })

  it('should set theme mode', () => {
    const setThemeMode = vi.spyOn(ThemeController, 'setThemeMode')

    const appKit = new AppKit(mockOptions)
    appKit.setThemeMode('light')

    expect(setThemeMode).toHaveBeenCalledWith('light')
  })

  it('should get theme variables', () => {
    vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValueOnce({
      '--w3m-accent': '#000'
    })

    const appKit = new AppKit(mockOptions)

    expect(appKit.getThemeVariables()).toEqual({ '--w3m-accent': '#000' })
  })

  it('should set theme variables', () => {
    const setThemeVariables = vi.spyOn(ThemeController, 'setThemeVariables')

    const appKit = new AppKit(mockOptions)
    const themeVariables = { '--w3m-accent': '#fff' }
    appKit.setThemeVariables(themeVariables)

    expect(setThemeVariables).toHaveBeenCalledWith(themeVariables)
  })

  it('should subscribe to theme changes', () => {
    const subscribe = vi.spyOn(ThemeController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeTheme(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })
})
