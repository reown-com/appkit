import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  type ApiControllerState,
  type BadgeType,
  ConnectorController,
  type ConnectorWithProviders,
  RouterController,
  type WcWallet
} from '@reown/appkit-controllers'

import { W3mAllWalletsSearch } from '../../src/partials/w3m-all-wallets-search'

// --- Constants ---------------------------------------------------- //
const mockWallet: WcWallet = { id: 'test-wallet', name: 'Test Wallet', rdns: 'test.rdns' }

describe('W3mAllWalletsSearch', () => {
  let element: W3mAllWalletsSearch

  beforeEach(async () => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }))

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 400
    })

    // Mock Element.prototype.animate
    Element.prototype.animate = vi.fn().mockReturnValue({
      finished: Promise.resolve()
    })

    element = await fixture(html`<w3m-all-wallets-search></w3m-all-wallets-search>`)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading spinner initially', () => {
    const spinner = element.shadowRoot?.querySelector('wui-loading-spinner')
    expect(spinner).toBeTruthy()
  })

  it('should render no wallet found message when search returns empty', async () => {
    const mockState: ApiControllerState = {
      search: [],
      page: 1,
      count: 0,
      featured: [],
      allFeatured: [],
      promises: {},
      allRecommended: [],
      filteredWallets: [],
      recommended: [],
      wallets: [],
      isAnalyticsEnabled: false,
      excludedWallets: [],
      isFetchingRecommendedWallets: false,
      explorerWallets: [],
      explorerFilteredWallets: []
    }
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockState)
    vi.spyOn(ApiController, 'searchWallet').mockResolvedValue()

    // @ts-ignore - Accessing private property for testing
    element.query = 'nonexistent'
    await elementUpdated(element)

    const noWalletMessage = element.shadowRoot?.querySelector(
      '[data-testid="no-wallet-found-text"]'
    )
    expect(noWalletMessage).toBeTruthy()
  })

  it('should render wallet list when search returns results', async () => {
    const mockWallets = [mockWallet]
    const mockState: ApiControllerState = {
      search: mockWallets,
      page: 1,
      count: mockWallets.length,
      promises: {},
      featured: [],
      allFeatured: [],
      recommended: [],
      allRecommended: [],
      filteredWallets: [],
      wallets: mockWallets,
      isAnalyticsEnabled: false,
      excludedWallets: [],
      isFetchingRecommendedWallets: false,
      explorerWallets: [],
      explorerFilteredWallets: []
    }
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockState)
    vi.spyOn(ApiController, 'searchWallet').mockResolvedValue()

    // @ts-ignore - Accessing private property for testing
    element.query = 'metamask'
    await elementUpdated(element)

    const walletList = element.shadowRoot?.querySelector('[data-testid="wallet-list"]')
    expect(walletList).toBeTruthy()

    const walletItem = element.shadowRoot?.querySelector(
      `[data-testid="wallet-search-item-${mockWallet.id}"]`
    )
    expect(walletItem).toBeTruthy()
  })

  it('should trigger search when query changes', async () => {
    const searchSpy = vi.spyOn(ApiController, 'searchWallet').mockResolvedValue()

    // @ts-ignore - Accessing private property for testing
    element.query = 'new search'
    await elementUpdated(element)

    expect(searchSpy).toHaveBeenCalledWith({
      search: 'new search',
      badge: undefined
    })
  })

  it('should handle wallet connection for external connector', async () => {
    const mockConnector: ConnectorWithProviders = {
      id: 'mock-connector',
      type: 'INJECTED',
      name: 'Mock Connector',
      provider: {} as any,
      chain: 'eip155'
    }
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(mockConnector)
    const routerPushSpy = vi.spyOn(RouterController, 'push')

    const mockExternalWallet = { ...mockWallet, id: 'external', rdns: 'mock.rdns' }

    // @ts-ignore - Accessing private method for testing
    element.onConnectWallet(mockExternalWallet)

    expect(ConnectorController.getConnector).toHaveBeenCalledWith({
      id: mockExternalWallet.id,
      rdns: mockExternalWallet.rdns
    })
    expect(routerPushSpy).toHaveBeenCalledWith('ConnectingExternal', {
      connector: mockConnector,
      wallet: mockExternalWallet
    })
  })

  it('should handle wallet connection for WalletConnect', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
    const routerPushSpy = vi.spyOn(RouterController, 'push')

    // @ts-ignore - Accessing private method for testing
    element.onConnectWallet(mockWallet)

    expect(ConnectorController.getConnector).toHaveBeenCalledWith({
      id: mockWallet.id,
      rdns: mockWallet.rdns
    })
    expect(routerPushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', { wallet: mockWallet })
  })

  it('should update search when badge property changes', async () => {
    const searchSpy = vi.spyOn(ApiController, 'searchWallet').mockResolvedValue()

    // @ts-ignore - Accessing private property for testing
    element.badge = 'recent' as BadgeType
    await elementUpdated(element)

    expect(searchSpy).toHaveBeenCalledWith({
      search: '',
      badge: 'recent'
    })
  })
})
