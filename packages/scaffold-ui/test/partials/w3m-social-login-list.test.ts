import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AuthConnector,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import * as SocialLoginUtils from '@reown/appkit-controllers/utils'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import { W3mSocialLoginList } from '../../src/partials/w3m-social-login-list'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSocialLoginList', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()

    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')

    vi.spyOn(OptionsController.state, 'remoteFeatures', 'get').mockReturnValue({
      socials: ['google', 'github']
    })
    vi.spyOn(RouterController.state, 'view', 'get').mockReturnValue('ConnectSocials')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should call executeSocialLogin when a social button is clicked', async () => {
    const executeSocialLoginSpy = vi.spyOn(SocialLoginUtils, 'executeSocialLogin')
    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const googleButton = HelpersUtil.querySelect(element, 'wui-list-social[name="google"]')
    expect(googleButton).toBeTruthy()

    await googleButton.click()

    expect(executeSocialLoginSpy).toHaveBeenCalledWith('google')
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

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )

    await element.updateComplete

    expect(mockInit).toHaveBeenCalled()

    await element.updateComplete

    const googleButton = HelpersUtil.getByTestId(element, 'social-selector-google')
    expect(googleButton.hasAttribute('disabled')).toBe(true)

    await vi.advanceTimersByTimeAsync(initDelay)

    await element.updateComplete

    expect(googleButton.hasAttribute('disabled')).toBe(false)
  })
})
