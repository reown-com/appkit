import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  ChainController,
  ConnectorController,
  type ConnectorTypeOrder,
  CoreHelperUtil,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mConnectorList } from '../../src/partials/w3m-connector-list'
import { ConnectorUtil } from '../../src/utils/ConnectorUtil'

const MOCK_CONNECTORS = {
  custom: [{ id: 'custom1', name: 'Custom' }],
  recent: [{ id: 'recent1', name: 'Recent' }],
  announced: [
    {
      id: 'announced1',
      name: 'Announced',
      info: { rdns: 'com.announced.wallet' }
    }
  ],
  injected: [{ id: 'injected1', name: 'Injected' }],
  multiChain: [{ id: 'multiChain1', name: 'MultiChain' }],
  recommended: [{ id: 'recommended1', name: 'Recommended' }],
  featured: [{ id: 'featured1', name: 'Featured' }],
  external: [{ id: 'external1', name: 'External' }]
} as ReturnType<typeof ConnectorUtil.getConnectorsByType>

describe('W3mConnectorList', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      excludedWallets: []
    })

    vi.spyOn(ApiController, 'fetchWallets').mockResolvedValue({
      data: [],
      count: 0,
      mobileFilteredOutWalletsLength: 0
    })

    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })
  })

  it('renders flattened items in correct order', async () => {
    vi.spyOn(ConnectorUtil, 'getConnectorsByType').mockReturnValue(MOCK_CONNECTORS)
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue([
      'walletConnect',
      'recent',
      'injected',
      'featured',
      'custom',
      'external',
      'recommended'
    ])

    // Provide connectors including WalletConnect connector
    const allConnectors = [
      { id: 'walletConnect', name: 'WalletConnect', type: 'ANNOUNCED' },
      ...(MOCK_CONNECTORS.announced as any),
      ...(MOCK_CONNECTORS.injected as any),
      ...(MOCK_CONNECTORS.multiChain as any),
      ...(MOCK_CONNECTORS.external as any)
    ]

    const element: W3mConnectorList = await fixture(
      html`<w3m-connector-list .connectors=${allConnectors}></w3m-connector-list>`
    )

    ;(element as any).explorerWallets = [{ id: 'MetaMask', name: 'MetaMask' }]
    await element.updateComplete

    const items = Array.from(
      element.shadowRoot?.querySelectorAll('w3m-list-wallet') ?? []
    ) as HTMLElement[]
    const names = items.map(i => i.getAttribute('name'))

    expect(names).toEqual([
      // walletConnect
      'WalletConnect',
      // injected group expands as multiChain -> announced -> injected
      'MultiChain',
      'Announced',
      'Injected',
      // featured, custom, external, recommended
      'Featured',
      'Custom',
      'External'
    ])

    // displayIndex increments across entire list
    const indices = items.map(i => Number(i.getAttribute('displayindex')))
    expect(indices).toEqual(indices.map((_, idx) => idx))
  })

  it('should render recent wallets in correct order', async () => {
    // Mock StorageUtil to provide a recent wallet
    vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([
      { id: 'recentX', name: 'Recent From Storage' } as any
    ])

    // Only render 'recent' slot
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue(['recent'])

    const element: W3mConnectorList = await fixture(
      html`<w3m-connector-list .connectors=${[]}></w3m-connector-list>`
    )
    ;(element as any).explorerWallets = []
    await element.updateComplete

    const items = Array.from(
      element.shadowRoot?.querySelectorAll('w3m-list-wallet') ?? []
    ) as HTMLElement[]

    expect(items.length).toBe(1)
    expect(items[0]?.getAttribute('name')).toBe('Recent From Storage')
    // Tag label should be set to "recent"
    expect(items[0]?.getAttribute('taglabel')).toBe('recent')
    // Display index should start from 0
    expect(items[0]?.getAttribute('displayindex')).toBe('0')
  })

  it('renders only specified types in order', async () => {
    vi.spyOn(ConnectorUtil, 'getConnectorsByType').mockReturnValue({
      ...MOCK_CONNECTORS,
      multiChain: [],
      announced: [],
      injected: MOCK_CONNECTORS.injected
    })
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue([
      'injected',
      'walletConnect',
      'external',
      'custom'
    ])

    const connectors = [
      { id: 'walletConnect', name: 'WalletConnect', type: 'ANNOUNCED' },
      ...(MOCK_CONNECTORS.injected as any),
      ...(MOCK_CONNECTORS.external as any)
    ]

    const element: W3mConnectorList = await fixture(
      html`<w3m-connector-list .connectors=${connectors}></w3m-connector-list>`
    )
    ;(element as any).explorerWallets = [{ id: 'MetaMask', name: 'MetaMask' }]
    await element.updateComplete

    const names = Array.from(element.shadowRoot?.querySelectorAll('w3m-list-wallet') ?? []).map(i =>
      i.getAttribute('name')
    )

    expect(names).toEqual(['Injected', 'WalletConnect', 'External', 'Custom'])
  })

  it('handles empty connector positions', async () => {
    vi.spyOn(ConnectorUtil, 'getConnectorsByType').mockReturnValue({
      custom: [],
      recent: [],
      announced: [],
      injected: [],
      multiChain: [],
      recommended: [],
      featured: [],
      external: []
    })
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue([])

    const element: W3mConnectorList = await fixture(
      html`<w3m-connector-list .connectors=${[]}></w3m-connector-list>`
    )

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(element.shadowRoot?.querySelectorAll('w3m-list-wallet').length).toBe(0)
  })

  it('handles non valid connector positions', async () => {
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue([
      'unknown'
    ] as unknown as ConnectorTypeOrder[])

    const element: W3mConnectorList = await fixture(
      html`<w3m-connector-list .connectors=${[]}></w3m-connector-list>`
    )

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(element.shadowRoot?.querySelectorAll('w3m-list-wallet').length).toBe(0)
  })
})
