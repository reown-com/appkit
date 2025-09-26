import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  type AccountState,
  type AuthConnector,
  ChainController,
  ConnectorController
} from '@reown/appkit-controllers'

import { W3mAccountView } from '../../src/views/w3m-account-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const ACCOUNT_WALLET_FEATURES_WIDGET = 'w3m-account-wallet-features-widget'
const ACCOUNT_DEFAULT_WIDGET = 'w3m-account-default-widget'

const authConnector = {
  provider: { getEmail: vi.fn() }
} as unknown as AuthConnector

describe('W3mAccountView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.state,
      address: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
    } as unknown as AccountState)
    vi.spyOn(ChainController, 'setChainAccountData').mockReturnValue(undefined)
  })

  it('should render', async () => {
    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    expect(element).toBeTruthy()
  })

  it('should not render when no namespace is available', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: undefined
    })

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    expect(element.shadowRoot?.childElementCount).toBe(0)
  })

  it('should render wallet features when connected with AUTH', async () => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    const widget = HelpersUtil.querySelect(element, ACCOUNT_WALLET_FEATURES_WIDGET)
    expect(widget).toBeTruthy()
  })

  it('should render default account widget when no auth connector exists', async () => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    const widget = HelpersUtil.querySelect(element, ACCOUNT_DEFAULT_WIDGET)
    expect(widget).toBeTruthy()
  })

  it('should render default account widget when AUTH connector exists but connectorId is not ID_AUTH', async () => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    const widget = HelpersUtil.querySelect(element, ACCOUNT_DEFAULT_WIDGET)
    expect(widget).toBeTruthy()
  })

  it('should render default account widget when connectorId is ID_AUTH but no auth connector exists', async () => {
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    const widget = HelpersUtil.querySelect(element, 'w3m-account-default-widget')
    expect(widget).toBeTruthy()
  })

  it('should call getConnectorId with current namespace', async () => {
    const getConnectorIdSpy = vi.spyOn(ConnectorController, 'getConnectorId')

    await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(getConnectorIdSpy).toHaveBeenCalledWith('eip155')
  })

  it('should call getAuthConnector without parameters', async () => {
    const getAuthConnectorSpy = vi.spyOn(ConnectorController, 'getAuthConnector')

    await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(getAuthConnectorSpy).toHaveBeenCalledWith()
  })

  it('should subscribe to ChainController state changes', async () => {
    const subscribeSpy = vi.spyOn(ChainController, 'subscribeKey')

    await fixture(html`<w3m-account-view></w3m-account-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('activeChain', expect.any(Function))
  })
})
