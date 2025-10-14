import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ApiController,
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
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'enteprise',
        isAboveRpcLimit: false,
        isAboveMauLimit: false
      }
    })

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

  it('should redirect to UsageExceeded view when starter tier user exceeds limits on social login click', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'starter',
        isAboveRpcLimit: true,
        isAboveMauLimit: false
      }
    })

    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const googleButton = HelpersUtil.querySelect(element, 'wui-list-social[name="google"]')
    expect(googleButton).toBeTruthy()

    await googleButton.click()

    expect(pushSpy).toHaveBeenCalledWith('UsageExceeded')
  })

  it('should redirect to UsageExceeded view when starter tier user exceeds MAU limit on social login click', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'starter',
        isAboveRpcLimit: false,
        isAboveMauLimit: true
      }
    })

    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const githubButton = HelpersUtil.querySelect(element, 'wui-list-social[name="github"]')
    expect(githubButton).toBeTruthy()

    await githubButton.click()

    expect(pushSpy).toHaveBeenCalledWith('UsageExceeded')
  })

  it('should NOT redirect to UsageExceeded view when enterprise tier user clicks social login', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'enteprise',
        isAboveRpcLimit: false,
        isAboveMauLimit: false
      }
    })

    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const googleButton = HelpersUtil.querySelect(element, 'wui-list-social[name="google"]')
    expect(googleButton).toBeTruthy()

    await googleButton.click()

    expect(pushSpy).not.toHaveBeenCalledWith('UsageExceeded')
  })

  it('should NOT redirect to UsageExceeded view when starter tier user has NOT exceeded limits', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'starter',
        isAboveRpcLimit: false,
        isAboveMauLimit: false
      }
    })

    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const githubButton = HelpersUtil.querySelect(element, 'wui-list-social[name="github"]')
    expect(githubButton).toBeTruthy()

    await githubButton.click()

    expect(pushSpy).not.toHaveBeenCalledWith('UsageExceeded')
  })

  it('should redirect to UsageExceeded view when starter tier user exceeds both RPC and MAU limits', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      plan: {
        tier: 'starter',
        isAboveRpcLimit: true,
        isAboveMauLimit: true
      }
    })

    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    vi.spyOn(CoreHelperUtil, 'isPWA').mockReturnValue(false)

    const element: W3mSocialLoginList = await fixture(
      html`<w3m-social-login-list></w3m-social-login-list>`
    )
    await element.updateComplete

    const googleButton = HelpersUtil.querySelect(element, 'wui-list-social[name="google"]')
    expect(googleButton).toBeTruthy()

    await googleButton.click()

    expect(pushSpy).toHaveBeenCalledWith('UsageExceeded')
  })
})
