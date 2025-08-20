import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController, ExchangeController } from '@reown/appkit-controllers'

import { W3mDepositFromExchangeView } from '../../src/views/w3m-deposit-from-exchange-view'
import { HelpersUtil } from '../utils/HelpersUtil'

const mockMainnet = {
  id: '1',
  name: 'Mainnet',
  chainNamespace: 'eip155',
  nativeCurrency: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
    }
  }
}

const mockSolanaMainnet = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana Mainnet',
  chainNamespace: 'solana',
  nativeCurrency: { symbol: 'SOL', name: 'Solana', decimals: 9 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
    }
  }
}

describe('W3mDepositFromExchangeView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set network native currency as payment asset', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockSolanaMainnet as unknown as CaipNetwork
    })

    const setPaymentAssetSpy = vi.spyOn(ExchangeController, 'setPaymentAsset')

    await fixture(html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`)

    expect(setPaymentAssetSpy).toHaveBeenCalledWith({
      network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      asset: 'native',
      metadata: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
      }
    })
    expect(setPaymentAssetSpy).toHaveBeenCalledTimes(1)

    // Test mainnet
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mockMainnet as unknown as CaipNetwork
    })

    await fixture(html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`)

    expect(setPaymentAssetSpy).toHaveBeenCalledWith({
      network: 'eip155:1',
      asset: 'native',
      metadata: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    })
    expect(setPaymentAssetSpy).toHaveBeenCalledTimes(2)
  })

  it('renders exchanges and asset chip, and calls controller on interactions', async () => {
    // Mock active network symbol for the asset chip
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: {
        nativeCurrency: { symbol: 'ETH' }
      }
    } as any)

    // Seed controller state for exchanges and amount
    ExchangeController.state.exchanges = [
      { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' },
      { id: 'ex2', imageUrl: 'https://img2', name: 'Exchange Two' }
    ] as any
    ExchangeController.state.amount = 0

    // Avoid side effects on firstUpdated
    vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue()

    const element: W3mDepositFromExchangeView = await fixture(
      html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`
    )
    await elementUpdated(element)

    // Asset chip should reflect network symbol
    const assetChip = HelpersUtil.getByTestId(element, 'deposit-from-exchange-asset-button')
    expect(assetChip).toBeTruthy()
    expect(assetChip?.getAttribute('text')).toContain('ETH')

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
})
