import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  ConnectorController,
  type ConnectorTypeOrder,
  CoreHelperUtil
} from '@reown/appkit-controllers'

import { W3mConnectorList } from '../../src/partials/w3m-connector-list'
import { ConnectorUtil } from '../../src/utils/ConnectorUtil'

const MOCK_CONNECTORS = {
  custom: [{ id: 'custom1', name: 'Custom' }],
  recent: [{ id: 'recent1', name: 'Recent' }],
  announced: [{ id: 'announced1', name: 'Announced' }],
  injected: [{ id: 'injected1', name: 'Injected' }],
  multiChain: [{ id: 'multiChain1', name: 'MultiChain' }],
  recommended: [{ id: 'recommended1', name: 'Recommended' }],
  featured: [{ id: 'featured1', name: 'Featured' }],
  external: [{ id: 'external1', name: 'External' }]
} as ReturnType<typeof ConnectorUtil.getConnectorsByType>

// Widgets
const WALLET_CONNECT_WIDGET = 'w3m-connect-walletconnect-widget'
const RECENT_WIDGET = 'w3m-connect-recent-widget'
const MULTI_CHAIN_WIDGET = 'w3m-connect-multi-chain-widget'
const ANNOUNCED_WIDGET = 'w3m-connect-announced-widget'
const INJECTED_WIDGET = 'w3m-connect-injected-widget'
const FEATURED_WIDGET = 'w3m-connect-featured-widget'
const CUSTOM_WIDGET = 'w3m-connect-custom-widget'
const EXTERNAL_WIDGET = 'w3m-connect-external-widget'
const RECOMMENDED_WIDGET = 'w3m-connect-recommended-widget'

describe('W3mConnectorList', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      excludedWallets: []
    })
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: []
    })
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      recommended: [],
      featured: []
    })
  })

  it('should render all connector types in correct order', async () => {
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

    const element: W3mConnectorList = await fixture(html`<w3m-connector-list></w3m-connector-list>`)
    const flexChildren = element.shadowRoot?.querySelector('wui-flex')?.children

    expect(flexChildren?.[0]?.tagName.toLowerCase()).toBe(WALLET_CONNECT_WIDGET)
    expect(flexChildren?.[1]?.tagName.toLowerCase()).toBe(RECENT_WIDGET)
    expect(flexChildren?.[2]?.tagName.toLowerCase()).toBe(MULTI_CHAIN_WIDGET)
    expect(flexChildren?.[3]?.tagName.toLowerCase()).toBe(ANNOUNCED_WIDGET)
    expect(flexChildren?.[4]?.tagName.toLowerCase()).toBe(INJECTED_WIDGET)
    expect(flexChildren?.[5]?.tagName.toLowerCase()).toBe(FEATURED_WIDGET)
    expect(flexChildren?.[6]?.tagName.toLowerCase()).toBe(CUSTOM_WIDGET)
    expect(flexChildren?.[7]?.tagName.toLowerCase()).toBe(EXTERNAL_WIDGET)
    expect(flexChildren?.[8]?.tagName.toLowerCase()).toBe(RECOMMENDED_WIDGET)
  })

  it('should render only specified connector types in correct order', async () => {
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

    const element: W3mConnectorList = await fixture(html`<w3m-connector-list></w3m-connector-list>`)
    const flexChildren = element.shadowRoot?.querySelector('wui-flex')?.children

    expect(flexChildren?.[0]?.tagName.toLowerCase()).toBe(INJECTED_WIDGET)
    expect(flexChildren?.[1]?.tagName.toLowerCase()).toBe(WALLET_CONNECT_WIDGET)
    expect(flexChildren?.[2]?.tagName.toLowerCase()).toBe(EXTERNAL_WIDGET)
    expect(flexChildren?.[3]?.tagName.toLowerCase()).toBe(CUSTOM_WIDGET)

    expect(flexChildren?.length).toBe(4)
  })

  it('should handle empty connector positions', async () => {
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

    const element: W3mConnectorList = await fixture(html`<w3m-connector-list></w3m-connector-list>`)

    expect(element.shadowRoot?.querySelector('wui-flex')?.children.length).toBe(0)
  })

  it('should handle non valid connector positions', async () => {
    vi.spyOn(ConnectorUtil, 'getConnectorTypeOrder').mockReturnValue([
      'unknown'
    ] as unknown as ConnectorTypeOrder[])

    const element: W3mConnectorList = await fixture(html`<w3m-connector-list></w3m-connector-list>`)

    expect(element.shadowRoot?.querySelector('wui-flex')?.children.length).toBe(0)
  })
})
