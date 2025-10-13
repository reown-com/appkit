import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  ChainController,
  ConnectorController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import type {
  ApiControllerState,
  ChainControllerState,
  Connector,
  WcWallet
} from '@reown/appkit-controllers'

import { W3mAllWalletsList } from '../../src/partials/w3m-all-wallets-list'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mAllWalletsList', () => {
  const mockWallets: WcWallet[] = [
    { id: '1', name: 'Wallet 1', rdns: 'rdns1' },
    { id: '2', name: 'Wallet 2', rdns: 'rdns2' }
  ]

  beforeEach(() => {
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

    Element.prototype.animate = vi.fn().mockReturnValue({
      finished: Promise.resolve()
    })

    // Mock controllers
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      wallets: mockWallets,
      recommended: [],
      featured: [],
      count: 2,
      page: 1
    } as unknown as ApiControllerState)

    vi.spyOn(ApiController, 'fetchWalletsByPage').mockResolvedValue()
    vi.spyOn(ApiController, 'subscribeKey').mockImplementation(() => () => {})
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'eip155',
      activeCaipNetwork: {
        id: '1',
        caipNetworkId: 'eip155:1',
        chainNamespace: 'eip155'
      }
    } as unknown as ChainControllerState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      wallets: [],
      recommended: [],
      featured: [],
      filteredWallets: [],
      count: 0,
      page: 1
    } as unknown as ApiControllerState)

    vi.useFakeTimers()
    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )
    const loaders = element.shadowRoot?.querySelectorAll('wui-card-select-loader')

    expect(loaders).toBeTruthy()
    vi.useRealTimers()
  })

  it('does not render duplicate wallets when present in multiple arrays', async () => {
    const duplicateWallet = { id: '1', name: 'Duplicate Wallet', rdns: 'rdns1' }
    const uniqueWallet = { id: '2', name: 'Unique Wallet', rdns: 'rdns2' }

    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      wallets: [duplicateWallet],
      recommended: [duplicateWallet],
      featured: [duplicateWallet, uniqueWallet],
      count: 2,
      page: 1
    } as unknown as ApiControllerState)

    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )

    // Simulate loading complete
    element.requestUpdate()
    await elementUpdated(element)

    const walletItems = element.shadowRoot?.querySelectorAll('w3m-all-wallets-list-item')
    expect(walletItems?.length).toBe(2) // Should only show 2 wallets, not 4

    // Verify the wallet items have unique IDs
    const walletIds = new Set(Array.from(walletItems || []).map(item => (item as any).wallet?.id))
    expect(walletIds.size).toBe(2)
  })

  it('renders wallet list after loading', async () => {
    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )

    // Simulate loading complete
    element.requestUpdate()
    await elementUpdated(element)

    const walletItems = element.shadowRoot?.querySelectorAll('w3m-all-wallets-list-item')
    expect(walletItems?.length).toBe(mockWallets.length)
  })

  it('should set the correct properties and values mobileFullScreen is true', async () => {
    OptionsController.state.enableMobileFullScreen = true

    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )

    await elementUpdated(element)

    expect(element.getAttribute('data-mobile-fullscreen')).toBe('true')
  })

  it('should set the correct properties and values mobileFullScreen is false', async () => {
    OptionsController.state.enableMobileFullScreen = false

    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )

    await elementUpdated(element)

    expect(element.getAttribute('data-mobile-fullscreen')).toBeNull()
  })

  it('handles wallet connection for external connector', async () => {
    const mockConnector = { id: 'test-connector' }
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(mockConnector as Connector)

    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )
    const walletItem = HelpersUtil.querySelect(element, 'w3m-all-wallets-list-item')
    await walletItem?.click()

    expect(RouterController.push).toHaveBeenCalledWith('ConnectingExternal', {
      connector: mockConnector,
      wallet: { ...mockWallets[0], display_index: 0, installed: false }
    })
  })

  it('handles wallet connection for WalletConnect', async () => {
    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )
    const walletItem = HelpersUtil.querySelect(element, 'w3m-all-wallets-list-item')
    await walletItem?.click()

    expect(RouterController.push).toHaveBeenCalledWith('ConnectingWalletConnect', {
      wallet: { ...mockWallets[0], installed: false, display_index: 0 }
    })
  })

  describe('Pagination', () => {
    it('creates pagination observer', async () => {
      const observeSpy = vi.fn()
      global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: observeSpy,
        disconnect: vi.fn()
      }))

      await fixture(html`<w3m-all-wallets-list></w3m-all-wallets-list>`)
      expect(observeSpy).toHaveBeenCalled()
    })

    it.skip('fetches more wallets when pagination observed', async () => {
      let observeCallback: IntersectionObserverCallback = () => {}

      global.IntersectionObserver = vi.fn().mockImplementation(callback => {
        observeCallback = callback
        return {
          observe: vi.fn(),
          disconnect: vi.fn()
        }
      })

      const element: W3mAllWalletsList = await fixture(
        html`<w3m-all-wallets-list></w3m-all-wallets-list>`
      )

      // Now pagination loader should be rendered
      // Create loader el w id
      const el = document.createElement('wui-card-select-loader')
      el.id = 'local-paginator'
      element.shadowRoot?.appendChild(el)

      const loaderEl = HelpersUtil.querySelect(element, '#local-paginator')
      expect(loaderEl).toBeTruthy() // Verify loader exists

      // After loader exists, pagination observer will be created
      observeCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )

      expect(ApiController.fetchWallets).toHaveBeenCalledWith({ page: 2 })
      vi.useRealTimers()
    })
  })

  it('cleans up observers and subscriptions on disconnect', async () => {
    const disconnectSpy = vi.fn()
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: disconnectSpy
    }))

    const element: W3mAllWalletsList = await fixture(
      html`<w3m-all-wallets-list></w3m-all-wallets-list>`
    )
    const unsubscribeSpy = vi.fn()
    ;(element as any).unsubscribe = [unsubscribeSpy]

    element.disconnectedCallback()

    expect(disconnectSpy).toHaveBeenCalled()
    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
