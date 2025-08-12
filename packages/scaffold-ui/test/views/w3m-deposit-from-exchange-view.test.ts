import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ChainController, ExchangeController } from '@reown/appkit-controllers'

import { W3mDepositFromExchangeView } from '../../src/views/w3m-deposit-from-exchange-view'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mDepositFromExchangeView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    vi.spyOn(ExchangeController, 'fetchTokenPrice').mockResolvedValue()

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
