import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork } from '@reown/appkit-common'
import {
  ChainController,
  ExchangeController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mDepositFromExchangeView } from '../../src/views/w3m-deposit-from-exchange-view'
import { HelpersUtil } from '../utils/HelpersUtil'

const mockMainnet = {
  id: '1',
  name: 'Mainnet',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1' as const,
  nativeCurrency: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
    }
  }
} as CaipNetwork

const mockSolanaMainnet = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana Mainnet',
  chainNamespace: 'solana',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as const,
  nativeCurrency: { symbol: 'SOL', name: 'Solana', decimals: 9 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
    }
  }
} as CaipNetwork

describe('W3mDepositFromExchangeView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and set default payment asset on first update', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockSolanaMainnet as unknown as CaipNetwork
    })

    const getAssetsForNetworkSpy = vi
      .spyOn(ExchangeController, 'getAssetsForNetwork')
      .mockResolvedValue([
        {
          network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          asset: 'native',
          price: 1,
          metadata: {
            iconUrl: 'https://img.solana.com/solana-logo-full.svg',
            name: 'Solana',
            symbol: 'SOL',
            decimals: 9
          }
        }
      ])
    const setPaymentAssetSpy = vi.spyOn(ExchangeController, 'setPaymentAsset')
    const fetchExchangesSpy = vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    await fixture(html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`)

    expect(getAssetsForNetworkSpy).toHaveBeenCalledWith('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
    expect(setPaymentAssetSpy).toHaveBeenCalledWith({
      network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      asset: 'native',
      price: 1,
      metadata: {
        iconUrl: 'https://img.solana.com/solana-logo-full.svg',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
      }
    })
    expect(fetchExchangesSpy).toHaveBeenCalled()
  })

  it('renders exchanges and asset token button, and calls controller on interactions', async () => {
    // Mock active network
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockMainnet as unknown as CaipNetwork
    })

    // Mock payment asset
    const mockPaymentAsset = {
      network: 'eip155:1' as const,
      asset: 'native',
      price: 1,
      metadata: {
        iconUrl: 'https://img.solana.com/solana-logo-full.svg',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    }

    // Seed controller state for exchanges and amount
    ExchangeController.state.exchanges = [
      { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' },
      { id: 'ex2', imageUrl: 'https://img2', name: 'Exchange Two' }
    ] as any
    ExchangeController.state.amount = 0
    ExchangeController.state.paymentAsset = mockPaymentAsset

    // Avoid side effects on firstUpdated
    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([mockPaymentAsset])
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mDepositFromExchangeView = await fixture(
      html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`
    )
    await elementUpdated(element)

    // Asset token button should reflect payment asset symbol
    const assetButton = HelpersUtil.getByTestId(element, 'deposit-from-exchange-asset-button')
    expect(assetButton).toBeTruthy()
    expect(assetButton?.getAttribute('text')).toBe('ETH')

    // Test asset button navigation
    const routerSpy = vi.spyOn(RouterController, 'push')
    assetButton?.click()
    expect(routerSpy).toHaveBeenCalledWith('PayWithExchangeSelectAsset')

    // There should be two rendered exchanges
    const items = HelpersUtil.querySelectAll(element, 'wui-list-item')
    expect(items?.length).toBe(2)

    // Clicking a preset amount should delegate to controller
    const setAmountSpy = vi.spyOn(ExchangeController, 'setAmount')
    const presetButtons = HelpersUtil.querySelectAll(element, 'wui-button')
    // Click the first preset ($10)
    presetButtons?.[0]?.click()
    await elementUpdated(element)
    expect(setAmountSpy).toHaveBeenCalledWith(10)

    // When amount is set, clicking an exchange should trigger handlePayWithExchange
    ExchangeController.state.amount = 25
    const handleSpy = vi.spyOn(ExchangeController, 'handlePayWithExchange').mockResolvedValue()
    items?.[0]?.click()
    expect(handleSpy).toHaveBeenCalledWith('ex1')
  })

  it('shows error when clicking exchange without amount', async () => {
    // Mock the SnackController
    const showErrorSpy = vi.spyOn(SnackController, 'showError')

    // Mock active network
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockMainnet as unknown as CaipNetwork
    })

    // Seed controller state for exchanges but no amount
    ExchangeController.state.exchanges = [
      { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' }
    ] as any
    ExchangeController.state.amount = 0

    // Avoid side effects on firstUpdated
    vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([])
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mDepositFromExchangeView = await fixture(
      html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`
    )
    await elementUpdated(element)

    const items = HelpersUtil.querySelectAll(element, 'wui-list-item')
    items?.[0]?.click()

    expect(showErrorSpy).toHaveBeenCalledWith('Please enter an amount')
  })
})
