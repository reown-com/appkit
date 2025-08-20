import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ExchangeController, type PaymentAsset, RouterController } from '@reown/appkit-controllers'

import { W3mDepositFromExchangeSelectAssetView } from '../../src/views/w3m-deposit-from-exchange-select-asset-view'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mDepositFromExchangeSelectAssetView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders asset list from controller state', async () => {
    const mockAssets = [
      {
        network: 'eip155:1' as const,
        asset: 'native',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          iconUrl: 'https://example.com/eth.png'
        }
      },
      {
        network: 'eip155:1' as const,
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        metadata: {
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          iconUrl: 'https://example.com/usdc.png'
        }
      }
    ]

    ExchangeController.state.assets = mockAssets

    const element: W3mDepositFromExchangeSelectAssetView = await fixture(
      html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`
    )
    await elementUpdated(element)

    const items = HelpersUtil.querySelectAll(element, 'wui-list-item')
    expect(items?.length).toBe(2)

    // Check that the assets are displayed correctly
    expect(element.shadowRoot?.textContent).toContain('Ethereum')
    expect(element.shadowRoot?.textContent).toContain('ETH')
    expect(element.shadowRoot?.textContent).toContain('USD Coin')
    expect(element.shadowRoot?.textContent).toContain('USDC')
  })

  it('filters assets based on search input', async () => {
    const mockAssets = [
      {
        network: 'eip155:1' as const,
        asset: 'native',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        }
      },
      {
        network: 'eip155:1' as const,
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        metadata: {
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6
        }
      }
    ]

    ExchangeController.state.assets = mockAssets

    const element: W3mDepositFromExchangeSelectAssetView = await fixture(
      html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`
    )
    await elementUpdated(element)

    // Simulate search input
    const searchInput = element.shadowRoot?.querySelector('wui-input-text')
    searchInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'usd' }))

    // Wait for debounced search to trigger
    await new Promise(resolve => setTimeout(resolve, 500))
    await elementUpdated(element)

    // Should only show USDC
    expect(element.shadowRoot?.textContent).toContain('USD Coin')
    expect(element.shadowRoot?.textContent).not.toContain('Ethereum')
  })

  it('handles asset selection and navigation', async () => {
    const mockAssets = [
      {
        network: 'eip155:1' as const,
        asset: 'native',
        metadata: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        }
      }
    ]

    ExchangeController.state.assets = mockAssets

    const setPaymentAssetSpy = vi.spyOn(ExchangeController, 'setPaymentAsset')
    const routerSpy = vi.spyOn(RouterController, 'goBack')

    const element: W3mDepositFromExchangeSelectAssetView = await fixture(
      html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`
    )
    await elementUpdated(element)

    const items = HelpersUtil.querySelectAll(element, 'wui-list-item')
    items?.[0]?.click()

    expect(setPaymentAssetSpy).toHaveBeenCalledWith(mockAssets[0])
    expect(routerSpy).toHaveBeenCalled()
  })

  it('shows empty state when no assets found', async () => {
    ExchangeController.state.assets = []

    const element: W3mDepositFromExchangeSelectAssetView = await fixture(
      html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`
    )
    await elementUpdated(element)

    expect(element.shadowRoot?.textContent).toContain('No tokens found')

    // Test buy button navigation
    const routerSpy = vi.spyOn(RouterController, 'push')
    const buyLink = element.shadowRoot?.querySelector('wui-link')
    buyLink?.click()

    expect(routerSpy).toHaveBeenCalledWith('OnRampProviders')
  })

  it('shows empty state when search returns no results', async () => {
    const mockAssets: PaymentAsset[] = []

    ExchangeController.state.assets = mockAssets

    const element: W3mDepositFromExchangeSelectAssetView = await fixture(
      html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`
    )
    await elementUpdated(element)

    // Search for something that doesn't exist
    const searchInput = element.shadowRoot?.querySelector('wui-input-text')
    searchInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'bitcoin' }))

    // Wait for debounced search to trigger
    await new Promise(resolve => setTimeout(resolve, 300))
    await elementUpdated(element)

    expect(element.shadowRoot?.textContent).toContain('No tokens found')
  })
})
