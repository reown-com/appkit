import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-controllers'
import { ConnectorController, RouterController } from '@reown/appkit-controllers'

import { W3mConnectMultiChainWidget } from '../../src/partials/w3m-connect-multi-chain-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const MOCK_MULTI_CHAIN_CONNECTOR: Connector = {
  id: 'mockMultiChain',
  name: 'Mock MultiChain',
  type: 'MULTI_CHAIN',
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

const WALLET_CONNECT_CONNECTOR: Connector = {
  id: 'walletConnect',
  name: 'WalletConnect',
  type: 'MULTI_CHAIN',
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

const INJECTED_CONNECTOR: Connector = {
  id: 'injected',
  name: 'Injected Wallet',
  type: 'INJECTED',
  provider: undefined,
  chain: CommonConstantsUtil.CHAIN.EVM
}

describe('W3mConnectMultiChainWidget', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should not render anything if there are no multi-chain connectors', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [INJECTED_CONNECTOR]
    })

    const element: W3mConnectMultiChainWidget = await fixture(
      html`<w3m-connect-multi-chain-widget></w3m-connect-multi-chain-widget>`
    )

    expect(element.style.display).toBe('none')
  })

  it('should render multi-chain connectors except WalletConnect', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_MULTI_CHAIN_CONNECTOR, WALLET_CONNECT_CONNECTOR, INJECTED_CONNECTOR]
    })

    const element: W3mConnectMultiChainWidget = await fixture(
      html`<w3m-connect-multi-chain-widget
        .connectors=${[MOCK_MULTI_CHAIN_CONNECTOR, WALLET_CONNECT_CONNECTOR, INJECTED_CONNECTOR]}
      ></w3m-connect-multi-chain-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const mockWalletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_MULTI_CHAIN_CONNECTOR.id}`
    )
    const walletConnectSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${WALLET_CONNECT_CONNECTOR.id}`
    )

    expect(mockWalletSelector).not.toBeNull()
    expect(mockWalletSelector.getAttribute('name')).toBe(MOCK_MULTI_CHAIN_CONNECTOR.name)
    expect(mockWalletSelector.getAttribute('tagLabel')).toBe('multichain')
    expect(mockWalletSelector.getAttribute('tagVariant')).toBe('info')
    expect(walletConnectSelector).toBeNull()
  })

  it('should handle unknown wallet names', async () => {
    const unknownConnector: Connector = {
      ...MOCK_MULTI_CHAIN_CONNECTOR,
      name: undefined
    } as unknown as Connector
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [unknownConnector]
    })

    const element: W3mConnectMultiChainWidget = await fixture(
      html`<w3m-connect-multi-chain-widget
        .connectors=${[unknownConnector]}
      ></w3m-connect-multi-chain-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${unknownConnector.id}`
    )
    expect(walletSelector).not.toBeNull()
    expect(walletSelector.getAttribute('name')).toBe('Unknown')
  })

  it('should set active connector and route to ConnectingMultiChain on click', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_MULTI_CHAIN_CONNECTOR]
    })
    const setActiveConnectorSpy = vi.spyOn(ConnectorController, 'setActiveConnector')
    const pushSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectMultiChainWidget = await fixture(
      html`<w3m-connect-multi-chain-widget
        .connectors=${[MOCK_MULTI_CHAIN_CONNECTOR]}
      ></w3m-connect-multi-chain-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_MULTI_CHAIN_CONNECTOR.id}`
    )
    expect(walletSelector).not.toBeNull()
    walletSelector.click()

    expect(setActiveConnectorSpy).toHaveBeenCalledWith(MOCK_MULTI_CHAIN_CONNECTOR)
    expect(pushSpy).toHaveBeenCalledWith('ConnectingMultiChain', {
      redirectView: undefined
    })
  })

  it('should handle tabIdx property', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [MOCK_MULTI_CHAIN_CONNECTOR]
    })

    const element: W3mConnectMultiChainWidget = await fixture(
      html`<w3m-connect-multi-chain-widget
        .tabIdx=${2}
        .connectors=${[MOCK_MULTI_CHAIN_CONNECTOR]}
      ></w3m-connect-multi-chain-widget>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const walletSelector = HelpersUtil.getByTestId(
      element,
      `wallet-selector-${MOCK_MULTI_CHAIN_CONNECTOR.id}`
    )
    expect(walletSelector).not.toBeNull()
    expect(walletSelector.getAttribute('tabIdx')).toBe('2')
  })
})
