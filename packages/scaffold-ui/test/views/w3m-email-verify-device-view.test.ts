import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AuthConnector,
  ConnectorController,
  EventsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import type { WuiLink } from '@reown/appkit-ui/wui-link'

import { W3mEmailVerifyDeviceView } from '../../src/views/w3m-email-verify-device-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const FLEX_CONTAINER_SELECTOR = 'wui-flex'
const ICON_BOX_SELECTOR = 'wui-icon-box'
const TEXT_SELECTOR = 'wui-text'
const LINK_SELECTOR = 'wui-link'

const MOCK_EMAIL = 'user@example.com'
const MOCK_AUTH_CONNECTOR = {
  provider: {
    connectDevice: vi.fn().mockResolvedValue(undefined),
    connectEmail: vi.fn().mockResolvedValue(undefined)
  }
} as unknown as AuthConnector

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('W3mEmailVerifyDeviceView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { email: MOCK_EMAIL }
    })
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    vi.spyOn(SnackController, 'showSuccess').mockImplementation(vi.fn())
    vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'replace').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'goBack').mockImplementation(vi.fn())
  })

  it('should render', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render email verification UI with correct content', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR)
    const iconBox = HelpersUtil.querySelect(element, ICON_BOX_SELECTOR)
    const texts = HelpersUtil.querySelectAll(element, TEXT_SELECTOR)
    const link = HelpersUtil.querySelect(element, LINK_SELECTOR)

    expect(container).toBeTruthy()
    expect(iconBox).toBeTruthy()
    expect(texts).toHaveLength(4)
    expect(link).toBeTruthy()

    const emailText = Array.from(texts || []).find(text => text.textContent?.includes(MOCK_EMAIL))
    expect(emailText).toBeTruthy()
  })

  it('should throw if no email provided', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {}
    })
    await expect(
      fixture<W3mEmailVerifyDeviceView>(
        html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
      )
    ).rejects.toThrowError(/No email provided/)
  })

  it('should throw if no auth connector provided', async () => {
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)
    await expect(
      fixture<W3mEmailVerifyDeviceView>(
        html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
      )
    ).rejects.toThrowError(/No auth connector provided/)
  })

  it('should trigger resend flow and success snackbar', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const link = HelpersUtil.querySelect(element, LINK_SELECTOR) as HTMLElement
    await link?.click()

    expect(MOCK_AUTH_CONNECTOR.provider.connectEmail).toHaveBeenCalledWith({ email: MOCK_EMAIL })
    expect(SnackController.showSuccess).toHaveBeenCalledWith('Code email resent')
  })

  it('should handle resend error and show error snackbar', async () => {
    const errorMessage = 'Failed to resend email'
    // @ts-expect-error
    MOCK_AUTH_CONNECTOR.provider.connectEmail.mockRejectedValueOnce(new Error(errorMessage))

    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const link = HelpersUtil.querySelect(element, LINK_SELECTOR) as HTMLElement
    await link?.click()

    expect(SnackController.showError).toHaveBeenCalledWith(new Error(errorMessage))
  })

  it('should disable resend link when loading', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    ;(element as any).loading = true
    await element.updateComplete

    const link = HelpersUtil.querySelect(element, LINK_SELECTOR) as WuiLink
    expect(link?.disabled).toBe(true)
  })

  it('should not trigger resend when already loading', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    ;(element as any).loading = true
    await element.updateComplete

    const link = HelpersUtil.querySelect(element, LINK_SELECTOR) as WuiLink
    await link?.click()

    expect(MOCK_AUTH_CONNECTOR.provider.connectEmail).not.toHaveBeenCalled()
  })

  it('should handle device approval success flow', async () => {
    await fixture(html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`)

    expect(MOCK_AUTH_CONNECTOR.provider.connectDevice).toHaveBeenCalled()
    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'DEVICE_REGISTERED_FOR_EMAIL'
    })
    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'EMAIL_VERIFICATION_CODE_SENT'
    })
    expect(RouterController.replace).toHaveBeenCalledWith('EmailVerifyOtp', { email: MOCK_EMAIL })
  })

  it('should handle device approval error and go back', async () => {
    // @ts-expect-error
    MOCK_AUTH_CONNECTOR.provider.connectDevice.mockRejectedValueOnce(
      new Error('Device approval failed')
    )

    await fixture(html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`)

    expect(RouterController.goBack).toHaveBeenCalled()
  })

  it('should show correct email in the UI', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const texts = HelpersUtil.querySelectAll(element, TEXT_SELECTOR)
    const emailText = Array.from(texts || []).find(text => text.textContent?.includes(MOCK_EMAIL))

    expect(emailText).toBeTruthy()
    expect(emailText?.textContent).toContain(MOCK_EMAIL)
  })

  it('should show correct resend link text', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const link = HelpersUtil.querySelect(element, LINK_SELECTOR)
    expect(link?.textContent?.trim()).toBe('Resend email')
  })

  it('should show correct instruction text', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const texts = HelpersUtil.querySelectAll(element, TEXT_SELECTOR)
    const instructionText = Array.from(texts || []).find(text =>
      text.textContent?.includes('Approve the login link we sent to')
    )

    expect(instructionText).toBeTruthy()
  })

  it('should show expiration message', async () => {
    const element: W3mEmailVerifyDeviceView = await fixture(
      html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
    )

    const texts = HelpersUtil.querySelectAll(element, TEXT_SELECTOR)
    const expirationText = Array.from(texts || []).find(text =>
      text.textContent?.includes('The code expires in 20 minutes')
    )

    expect(expirationText).toBeTruthy()
  })
})
