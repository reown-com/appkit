import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AccountController,
  type AuthConnector,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController
} from '@reown/appkit-core'

import { W3mSocialLoginWidget } from '../../src/partials/w3m-social-login-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSocialLoginWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle standard social login flow when clicking Google button', async () => {
    const mockWindow = { location: { href: '' } }
    const mockUri = 'https://auth.example.com/login'

    vi.spyOn(OptionsController.state, 'features', 'get').mockReturnValue({
      ...OptionsController.state.features,
      socials: ['google']
    })
    vi.spyOn(AccountController, 'setSocialProvider')
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(mockWindow as Window)
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      provider: {
        getSocialRedirectUri: vi.fn().mockResolvedValue({ uri: mockUri })
      }
    } as unknown as AuthConnector)
    vi.spyOn(AccountController, 'setSocialWindow')

    const element: W3mSocialLoginWidget = await fixture(
      html`<w3m-social-login-widget></w3m-social-login-widget>`
    )

    const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
    await googleButton.click()

    expect(CoreHelperUtil.returnOpenHref).toHaveBeenCalledWith(
      '',
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    expect(AccountController.setSocialWindow).toHaveBeenCalledWith(mockWindow, 'eip155')
    expect(mockWindow.location.href).toBe(mockUri)
  })
})
