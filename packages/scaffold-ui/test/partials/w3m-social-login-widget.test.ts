import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AuthConnector,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
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

  it('should handle standard social login flow when clicking Google button', async () => {
    const mockWindow = { location: { href: '' } }
    const mockUri = 'https://auth.example.com/login'

    vi.spyOn(OptionsController.state, 'remoteFeatures', 'get').mockReturnValue({
      ...OptionsController.state.remoteFeatures,
      socials: ['google']
    })
    vi.spyOn(ChainController, 'setAccountProp')
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(mockWindow as Window)
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      provider: {
        getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: mockUri })
      },
      type: 'AUTH'
    } as unknown as AuthConnector)
    vi.spyOn(ChainController, 'setAccountProp')

    const element: W3mSocialLoginWidget = await fixture(
      html`<w3m-social-login-widget></w3m-social-login-widget>`
    )

    const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
    await googleButton.click()

    expect(CoreHelperUtil.returnOpenHref).toHaveBeenCalledWith(
      'https://secure.walletconnect.org/loading',
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    expect(ChainController.setAccountProp).toHaveBeenCalledWith(
      'socialProvider',
      'google',
      'eip155'
    )
    expect(ChainController.setAccountProp).toHaveBeenCalledWith(
      'socialWindow',
      mockWindow,
      'eip155'
    )
    expect(mockWindow.location.href).toBe(mockUri)
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
