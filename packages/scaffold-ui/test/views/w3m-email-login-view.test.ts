import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type Connector, ConnectorController, OptionsController } from '@reown/appkit-controllers'
import { ConstantsUtil as AppKitConstantsUtil } from '@reown/appkit-utils'

import { W3mEmailLoginView } from '../../src/views/w3m-email-login-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const FLEX_CONTAINER_SELECTOR = 'wui-flex'
const EMAIL_LOGIN_WIDGET_SELECTOR = 'w3m-email-login-widget'

const MOCK_AUTH_CONNECTOR = {
  id: 'auth-connector',
  name: 'Auth Connector',
  type: AppKitConstantsUtil.CONNECTOR_TYPE_AUTH,
  chain: 'eip155'
}

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('W3mEmailLoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { email: true }
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_AUTH_CONNECTOR] as never
    })
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR as never)
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(vi.fn())
    )
  })

  it('should render', async () => {
    const element: W3mEmailLoginView = await fixture(
      html`<w3m-email-login-view></w3m-email-login-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render email login widget when conditions are met', async () => {
    const element: W3mEmailLoginView = await fixture(
      html`<w3m-email-login-view></w3m-email-login-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR)
    const emailWidget = HelpersUtil.querySelect(element, EMAIL_LOGIN_WIDGET_SELECTOR)

    expect(container).toBeTruthy()
    expect(emailWidget).toBeTruthy()
  })

  it('should throw when email is disabled', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { email: false }
    })
    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/Email is not enabled/)
  })

  it('should throw when no auth connector provided', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [{ type: 'injected', chain: 'eip155' }] as never
    })
    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/No auth connector provided/)
  })

  it('should throw when auth connector is not for supported chain', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [{ type: AppKitConstantsUtil.CONNECTOR_TYPE_AUTH, chain: 'unsupported' }] as never
    })
    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/No auth connector provided/)
  })

  it('should accept auth connector for supported chain', async () => {
    const supportedChain = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS[0]
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [
        { type: AppKitConstantsUtil.CONNECTOR_TYPE_AUTH, chain: supportedChain }
      ] as Connector[]
    })

    const element: W3mEmailLoginView = await fixture(
      html`<w3m-email-login-view></w3m-email-login-view>`
    )

    const emailWidget = HelpersUtil.querySelect(element, EMAIL_LOGIN_WIDGET_SELECTOR)
    expect(emailWidget).toBeTruthy()
  })

  it('should accept multiple auth connectors if one is for supported chain', async () => {
    const supportedChain = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS[0]
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [
        { type: AppKitConstantsUtil.CONNECTOR_TYPE_AUTH, chain: 'unsupported' },
        { type: AppKitConstantsUtil.CONNECTOR_TYPE_AUTH, chain: supportedChain }
      ] as Connector[]
    })

    const element: W3mEmailLoginView = await fixture(
      html`<w3m-email-login-view></w3m-email-login-view>`
    )

    const emailWidget = HelpersUtil.querySelect(element, EMAIL_LOGIN_WIDGET_SELECTOR)
    expect(emailWidget).toBeTruthy()
  })

  it('should subscribe to ConnectorController state changes', async () => {
    const subscribeSpy = vi
      .spyOn(ConnectorController, 'subscribeKey')
      .mockImplementation(vi.fn().mockReturnValue(vi.fn()))

    await fixture(html`<w3m-email-login-view></w3m-email-login-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('connectors', expect.any(Function))
  })

  it('should handle empty connectors array', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })

    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/No auth connector provided/)
  })

  it('should handle undefined remoteFeatures', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: undefined
    })

    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/Email is not enabled/)
  })

  it('should handle undefined email feature', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { email: undefined }
    })

    await expect(
      fixture<W3mEmailLoginView>(html`<w3m-email-login-view></w3m-email-login-view>`)
    ).rejects.toThrowError(/Email is not enabled/)
  })
})
