import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetworkId } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mConnectRecentWidget } from '../../src/partials/w3m-connect-recent-widget'

describe('W3mConnectRecentWidget', () => {
  const mockRecentWallets = [
    { id: 'recent1', name: 'Recent Wallet 1', chains: ['eip155:1'] as CaipNetworkId[] },
    { id: 'recent2', name: 'Recent Wallet 2', chains: ['eip155:1'] as CaipNetworkId[] }
  ]

  const mockConnectors = [
    { id: 'connector1', name: 'Connector 1' },
    { id: 'recent1', name: 'Recent Wallet 1' } // Matching wallet
  ]

  let subscribeCallback: (connectors: any) => void

  beforeEach(() => {
    subscribeCallback = vi.fn()

    vi.clearAllMocks()

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      connectors: mockConnectors
    } as any)

    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation((_, callback) => {
      subscribeCallback = callback
      return () => undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render filtered recent wallets when there are matching connectors', async () => {
    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(1)

    const walletName = walletElements?.[0]?.getAttribute('name')
    expect(walletName).toBe('Recent Wallet 2')
  })

  it('should render all recent wallets when there are no matching connectors', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      connectors: [{ id: 'connector1', name: 'Connector 1' }]
    } as any)

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))
    expect(walletNames).toContain('Recent Wallet 1')
    expect(walletNames).toContain('Recent Wallet 2')
  })

  it('should not render widget when there are no recent wallets', async () => {
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([])

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    expect(element.style.display).toBe('none')
    expect(element.shadowRoot?.querySelector('wui-flex')).toBeNull()
  })

  it('should handle wallet click and navigate to connecting view', async () => {
    const routerSpy = vi.spyOn(RouterController, 'push')

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElement = element.shadowRoot?.querySelector('wui-list-wallet')
    walletElement?.click()

    expect(routerSpy).toHaveBeenCalledWith('ConnectingWalletConnect', {
      wallet: mockRecentWallets[1]
    })
  })

  it('should respect tabIdx property', async () => {
    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget .tabIdx=${2}></w3m-connect-recent-widget>`
    )

    const walletElement = element.shadowRoot?.querySelector('wui-list-wallet')
    expect(walletElement?.getAttribute('tabIdx')).toBe('2')
  })

  it('should update when connectors change', async () => {
    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    expect(element.shadowRoot?.querySelectorAll('wui-list-wallet').length).toBe(1)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      connectors: [{ id: 'connector1', name: 'Connector 1' }]
    } as any)

    subscribeCallback([{ id: 'connector1', name: 'Connector 1' }])

    await element.updateComplete

    expect(element.shadowRoot?.querySelectorAll('wui-list-wallet').length).toBe(2)
  })

  it('should filter wallets by EIP-155 chain namespace', async () => {
    const eip155Wallets = [
      {
        id: 'eth1',
        name: 'Ethereum Wallet',
        chains: ['eip155:1', 'eip155:137'] as CaipNetworkId[]
      },
      { id: 'eth2', name: 'Polygon Wallet', chains: ['eip155:137'] as CaipNetworkId[] }
    ]

    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(eip155Wallets)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))
    expect(walletNames).toContain('Ethereum Wallet')
    expect(walletNames).toContain('Polygon Wallet')
  })

  it('should filter wallets by Solana chain namespace', async () => {
    const solanaWallets = [
      {
        id: 'sol1',
        name: 'Solana Wallet',
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipNetworkId[]
      },
      {
        id: 'sol2',
        name: 'Solana Wallet 2',
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipNetworkId[]
      }
    ]

    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(solanaWallets)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'solana'
    })

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))
    expect(walletNames).toContain('Solana Wallet')
    expect(walletNames).toContain('Solana Wallet 2')
  })

  it('should filter wallets by Bitcoin chain namespace', async () => {
    const bitcoinWallets = [
      { id: 'btc1', name: 'Bitcoin Wallet', chains: ['bip122:0'] as CaipNetworkId[] },
      { id: 'btc2', name: 'Bitcoin Wallet 2', chains: ['bip122:0'] as CaipNetworkId[] }
    ]

    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(bitcoinWallets)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'bip122'
    })

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))
    expect(walletNames).toContain('Bitcoin Wallet')
    expect(walletNames).toContain('Bitcoin Wallet 2')
  })

  it('should only show wallets matching the active chain namespace', async () => {
    const mixedWallets = [
      { id: 'eth1', name: 'Ethereum Wallet', chains: ['eip155:1'] as CaipNetworkId[] },
      {
        id: 'sol1',
        name: 'Solana Wallet',
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipNetworkId[]
      },
      { id: 'btc1', name: 'Bitcoin Wallet', chains: ['bip122:0'] as CaipNetworkId[] }
    ]

    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mixedWallets)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'solana'
    })

    const element: W3mConnectRecentWidget = await fixture(
      html`<w3m-connect-recent-widget></w3m-connect-recent-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(1)

    const walletName = walletElements?.[0]?.getAttribute('name')
    expect(walletName).toBe('Solana Wallet')
  })
})
