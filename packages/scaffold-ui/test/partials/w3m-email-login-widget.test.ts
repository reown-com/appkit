import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import {
  type AuthConnector,
  ChainController,
  type ChainControllerState,
  ConnectionController,
  ConnectorController,
  EventsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mEmailLoginWidget } from '../../src/partials/w3m-email-login-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

const mainnet = {
  id: 1,
  name: 'Ethereum',
  namespace: ConstantsUtil.CHAIN.EVM
} as unknown as CaipNetwork

describe('W3mEmailLoginWidget', () => {
  const mockEmail = 'test@example.com'
  const mockAuthConnector = {
    provider: {
      connectEmail: vi.fn()
    }
  }

  beforeEach(() => {
    vi.mocked(ChainController.state).activeChain = ConstantsUtil.CHAIN.EVM
    vi.mocked(ChainController.state).chains = new Map([
      [ConstantsUtil.CHAIN.EVM, { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mainnet] }]
    ]) as unknown as ChainControllerState['chains']
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(
      mockAuthConnector as unknown as AuthConnector
    )
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'replace').mockImplementation(vi.fn())
    vi.spyOn(ConnectionController, 'connectExternal').mockImplementation(vi.fn())
    vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input form', async () => {
    const element: W3mEmailLoginWidget = await fixture(
      html`<w3m-email-login-widget></w3m-email-login-widget>`
    )

    expect(HelpersUtil.querySelect(element, 'wui-email-input')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'form')).toBeTruthy()
  })

  describe('Email Input', () => {
    it('updates email value on input change', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      expect(element.email).toBe(mockEmail)
    })

    it('shows submit button when email is long enough', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      expect(HelpersUtil.querySelect(element, 'wui-icon-link')).toBeTruthy()
    })

    it('triggers tracking event on focus', async () => {
      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )

      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new Event('focus'))

      expect(EventsController.sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'EMAIL_LOGIN_SELECTED'
      })
    })
  })

  describe('Form Submission', () => {
    it('redirects to network switch when on unsupported chain', async () => {
      vi.mocked(ChainController.state).activeChain = 'unsupported' as ChainNamespace

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const form = HelpersUtil.querySelect(element, 'form')
      form?.dispatchEvent(new Event('submit'))

      expect(RouterController.push).toHaveBeenCalledWith('SwitchNetwork', { network: mainnet })
    })

    it('handles VERIFY_OTP action', async () => {
      mockAuthConnector.provider.connectEmail.mockResolvedValue({ action: 'VERIFY_OTP' })

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      const form = HelpersUtil.querySelect(element, 'form')
      await form?.dispatchEvent(new Event('submit'))

      expect(RouterController.push).toHaveBeenCalledWith('EmailVerifyOtp', {
        email: mockEmail
      })
    })

    it('handles VERIFY_DEVICE action', async () => {
      mockAuthConnector.provider.connectEmail.mockResolvedValue({ action: 'VERIFY_DEVICE' })

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      const form = HelpersUtil.querySelect(element, 'form')
      await form?.dispatchEvent(new Event('submit'))

      expect(RouterController.push).toHaveBeenCalledWith('EmailVerifyDevice', {
        email: mockEmail
      })
    })

    it('handles CONNECT action', async () => {
      vi.useFakeTimers()
      mockAuthConnector.provider.connectEmail.mockResolvedValue({ action: 'CONNECT' })

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))
      await elementUpdated(element)
      const form = HelpersUtil.querySelect(element, 'form')
      await form?.dispatchEvent(new Event('submit'))

      await vi.advanceTimersByTime(1000)
      expect(ConnectionController.connectExternal).toHaveBeenCalled()
      expect(RouterController.replace).toHaveBeenCalledWith('Account')
      vi.useRealTimers()
    })

    it('shows loading state during submission', async () => {
      mockAuthConnector.provider.connectEmail.mockImplementation(() => new Promise(() => {}))

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      const form = HelpersUtil.querySelect(element, 'form')
      form?.dispatchEvent(new Event('submit'))

      await elementUpdated(element)
      expect(HelpersUtil.querySelect(element, 'wui-loading-spinner')).toBeTruthy()
    })

    it('handles invalid email error', async () => {
      mockAuthConnector.provider.connectEmail.mockRejectedValue(new Error('Invalid email'))

      const element: W3mEmailLoginWidget = await fixture(
        html`<w3m-email-login-widget></w3m-email-login-widget>`
      )
      const emailInput = HelpersUtil.querySelect(element, 'wui-email-input')
      emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: mockEmail }))

      await elementUpdated(element)
      const form = HelpersUtil.querySelect(element, 'form')
      await form?.dispatchEvent(new Event('submit'))

      element.requestUpdate()
      await elementUpdated(element)

      const errorText = HelpersUtil.querySelect(element, 'wui-text')
      expect(errorText?.textContent?.trim()).toBe('Invalid email. Try again.')
    })
  })
})
