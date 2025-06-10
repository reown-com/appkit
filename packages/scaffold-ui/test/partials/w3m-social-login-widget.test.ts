import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AuthConnector,
  ConnectorController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import { W3mSocialLoginWidget } from '../../src/partials/w3m-social-login-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSocialLoginWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should render social login buttons when auth connector and socials are available', async () => {
    const mockAuthConnector = {
      provider: {
        getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: 'https://auth.example.com/login' })
      },
      type: 'AUTH'
    } as unknown as AuthConnector

    vi.spyOn(OptionsController.state, 'remoteFeatures', 'get').mockReturnValue({
      socials: ['google', 'x']
    })
    vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([mockAuthConnector])

    const element: W3mSocialLoginWidget = await fixture(
      html`<w3m-social-login-widget></w3m-social-login-widget>`
    )

    await element.updateComplete

    const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
    const xButton = HelpersUtil.getByTestId(element, 'social-selector-x')
    
    expect(googleButton).toBeTruthy()
    expect(xButton).toBeTruthy()
    expect(googleButton.hasAttribute('disabled')).toBe(false)
    expect(xButton.hasAttribute('disabled')).toBe(false)
  })

  it('should load auth frame in PWA environment and manage loading state', async () => {
    const initDelay = 500
    const mockInit = vi.fn(() => new Promise(resolve => setTimeout(resolve, initDelay)))

    const mockProvider = Object.create(W3mFrameProvider.prototype)
    mockProvider.init = mockInit

    const mockAuthConnector = {
      provider: mockProvider,
      type: 'AUTH'
    } as unknown as AuthConnector

    vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([mockAuthConnector])

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(true)
    vi.spyOn(OptionsController.state, 'remoteFeatures', 'get').mockReturnValue({
      ...OptionsController.state.remoteFeatures,
      socials: ['google']
    })

    const element: W3mSocialLoginWidget = await fixture(
      html`<w3m-social-login-widget></w3m-social-login-widget>`
    )

    await element.updateComplete

    expect(mockInit).toHaveBeenCalled()

    const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
    expect(googleButton.hasAttribute('disabled')).toBe(true)

    await vi.advanceTimersByTimeAsync(initDelay)

    await element.updateComplete

    expect(googleButton.hasAttribute('disabled')).toBe(false)
  })
})
