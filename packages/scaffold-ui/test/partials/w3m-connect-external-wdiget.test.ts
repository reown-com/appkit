import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorWithProviders } from '@reown/appkit-controllers'
import { ConnectorController, RouterController } from '@reown/appkit-controllers'

import { W3mConnectExternalWidget } from '../../src/partials/w3m-connect-external-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const MOCK_EXTERNAL_CONNECTOR: ConnectorWithProviders = {
  id: 'mockExternal',
  name: 'Mock External Wallet',
  type: 'EXTERNAL',
  chain: CommonConstantsUtil.CHAIN.EVM,
  provider: undefined
} as ConnectorWithProviders

const MOCK_COINBASE_CONNECTOR: ConnectorWithProviders = {
  id: 'coinbaseWalletSDK',
  name: 'Coinbase Wallet',
  type: 'EXTERNAL',
  chain: CommonConstantsUtil.CHAIN.EVM,
  provider: undefined
} as ConnectorWithProviders

describe('W3mConnectExternalWidget', () => {
  beforeEach(() => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything if there are no external connectors', async () => {
    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should not render anything if only Coinbase Wallet SDK is available', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_COINBASE_CONNECTOR]
    })

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render external connectors excluding Coinbase Wallet', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_EXTERNAL_CONNECTOR, MOCK_COINBASE_CONNECTOR]
    })

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-external-${MOCK_EXTERNAL_CONNECTOR.id}`
    )
    expect(walletSelector).not.toBeNull()
    expect(walletSelector?.getAttribute('name')).toBe(MOCK_EXTERNAL_CONNECTOR.name)
  })

  it('should handle unknown wallet names', async () => {
    const unknownConnector = {
      id: 'mockExternal',
      type: 'EXTERNAL',
      chain: CommonConstantsUtil.CHAIN.EVM,
      provider: undefined
    } as ConnectorWithProviders

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [unknownConnector]
    })

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-external-${unknownConnector.id}`
    )
    expect(walletSelector?.getAttribute('name')).toBe('Unknown')
  })

  it('should route to ConnectingExternal when wallet is clicked', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_EXTERNAL_CONNECTOR]
    })
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-external-${MOCK_EXTERNAL_CONNECTOR.id}`
    )
    walletSelector?.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', {
      connector: MOCK_EXTERNAL_CONNECTOR
    })
  })

  it('should respect tabIdx property', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_EXTERNAL_CONNECTOR]
    })

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget .tabIdx=${2}></w3m-connect-external-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-external-${MOCK_EXTERNAL_CONNECTOR.id}`
    )
    expect(walletSelector?.getAttribute('tabIdx')).toBe('2')
  })

  it('should update when connectors change', async () => {
    let subscriptionCallback: (val: any) => void = () => {}
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation((_, callback) => {
      subscriptionCallback = callback
      return () => {}
    })

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    await element.updateComplete

    expect(element.shadowRoot?.querySelectorAll('wui-list-wallet').length).toBe(0)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_EXTERNAL_CONNECTOR]
    })

    subscriptionCallback([MOCK_EXTERNAL_CONNECTOR])

    element.requestUpdate()
    await element.updateComplete
    await elementUpdated(element)

    expect(element.shadowRoot?.querySelectorAll('wui-list-wallet').length).toBe(1)
  })
})
