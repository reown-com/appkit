import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountController } from '../../src/controllers/AccountController'
import { BlockchainApiController } from '../../src/controllers/BlockchainApiController'
import { EventsController } from '../../src/controllers/EventsController'
import { ExchangeController } from '../../src/controllers/ExchangeController'
import { SnackController } from '../../src/controllers/SnackController'
import * as ChainControllerUtil from '../../src/utils/ChainControllerUtil'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil'
import * as ExchangeUtil from '../../src/utils/ExchangeUtil'

describe('ExchangeController', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('fetchTokenPrice sets price and toggles loading', async () => {
    vi.spyOn(ChainControllerUtil, 'getActiveNetworkTokenAddress').mockReturnValue(
      'eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )
    vi.spyOn(BlockchainApiController, 'fetchTokenPrice').mockResolvedValue({
      fungibles: [{ price: 123.45 }]
    } as any)

    await ExchangeController.fetchTokenPrice()

    expect(BlockchainApiController.fetchTokenPrice).toHaveBeenCalledWith({
      addresses: ['eip155:1:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']
    })
    expect(ExchangeController.state.tokenPrice).toBe(123.45)
    expect(ExchangeController.state.priceLoading).toBe(false)
  })

  it('getTokenAmount returns computed amount', () => {
    ExchangeController.state.amount = 10
    ExchangeController.state.tokenPrice = 2

    const value = ExchangeController.getTokenAmount()
    expect(value).toBe(5)
  })

  it('setAmount updates amount and tokenAmount when price exists', () => {
    ExchangeController.state.tokenPrice = 4
    ExchangeController.setAmount(10)
    expect(ExchangeController.state.amount).toBe(10)
    expect(ExchangeController.state.tokenAmount).toBe(2.5)
  })

  describe('fetchExchanges', () => {
    it('loads exchanges and truncates to two', async () => {
      const mockResponse = {
        exchanges: [
          { id: 'ex1', imageUrl: 'https://img1', name: 'Ex1' },
          { id: 'ex2', imageUrl: 'https://img2', name: 'Ex2' },
          { id: 'ex3', imageUrl: 'https://img3', name: 'Ex3' }
        ],
        total: 3
      }
      vi.spyOn(ExchangeUtil, 'getExchanges').mockResolvedValue(mockResponse)

      ExchangeController.state.amount = 100
      await ExchangeController.fetchExchanges()

      expect(ExchangeUtil.getExchanges).toHaveBeenCalledWith({
        page: 0,
        asset: 'eip155:1/slip44:60',
        amount: '100'
      })
      expect(ExchangeController.state.exchanges).toEqual(mockResponse.exchanges.slice(0, 2))
      expect(ExchangeController.state.isLoading).toBe(false)
    })

    it('shows error and rethrows on failure', async () => {
      vi.spyOn(ExchangeUtil, 'getExchanges').mockRejectedValue(new Error('network error'))
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await expect(ExchangeController.fetchExchanges()).rejects.toThrow('Unable to get exchanges')
      expect(SnackController.showError).toHaveBeenCalledWith('Unable to get exchanges')
      expect(ExchangeController.state.isLoading).toBe(false)
    })
  })

  describe('getPayUrl', () => {
    it('requests pay URL and sends analytics event', async () => {
      vi.spyOn(ExchangeUtil, 'getPayUrl').mockResolvedValue({
        url: 'https://pay.url',
        sessionId: 'sess-1'
      })
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

      const result = await ExchangeController.getPayUrl('ex1', {
        network: 'eip155:1',
        asset: 'native',
        amount: '1.5',
        recipient: '0xabc'
      })

      expect(ExchangeUtil.getPayUrl).toHaveBeenCalledWith({
        exchangeId: 'ex1',
        asset: 'eip155:1/slip44:60',
        amount: '1.5',
        recipient: 'eip155:1:0xabc'
      })
      expect(EventsController.sendEvent).toHaveBeenCalled()
      expect(result).toEqual({ url: 'https://pay.url', sessionId: 'sess-1' })
    })

    it('throws Asset not supported when error message indicates unsupported asset', async () => {
      vi.spyOn(ExchangeUtil, 'getPayUrl').mockRejectedValue(new Error('token is not supported'))

      await expect(
        ExchangeController.getPayUrl('ex1', {
          network: 'eip155:1',
          asset: 'native',
          amount: '1',
          recipient: '0xabc'
        })
      ).rejects.toThrow('Asset not supported')
    })

    it('rethrows generic error messages', async () => {
      vi.spyOn(ExchangeUtil, 'getPayUrl').mockRejectedValue(new Error('boom'))

      await expect(
        ExchangeController.getPayUrl('ex1', {
          network: 'eip155:1',
          asset: 'native',
          amount: '1',
          recipient: '0xabc'
        })
      ).rejects.toThrow('boom')
    })
  })

  describe('handlePayWithExchange', () => {
    it('opens pay URL and updates current payment state', async () => {
      AccountController.state.address = '0xabc'
      ExchangeController.state.amount = 2
      vi.spyOn(ExchangeController, 'getPayUrl').mockResolvedValue({
        url: 'https://pay.url',
        sessionId: 'sess-123'
      })
      vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(ExchangeController.getPayUrl).toHaveBeenCalled()
      expect(ExchangeController.state.currentPayment?.status).toBe('IN_PROGRESS')
      expect(ExchangeController.state.currentPayment?.sessionId).toBe('sess-123')
      expect(ExchangeController.state.currentPayment?.exchangeId).toBe('ex1')
      expect(CoreHelperUtil.openHref).toHaveBeenCalledWith('https://pay.url', '_blank')
    })

    it('shows error if no account connected', async () => {
      AccountController.state.address = undefined
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(SnackController.showError).toHaveBeenCalledWith('Unable to initiate payment')
      expect(ExchangeController.state.error).toBe('Unable to initiate payment')
    })

    it('shows error if pay url cannot be obtained', async () => {
      AccountController.state.address = '0xabc'
      vi.spyOn(ExchangeController, 'getPayUrl').mockResolvedValue(undefined as any)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(SnackController.showError).toHaveBeenCalledWith('Unable to initiate payment')
      expect(ExchangeController.state.error).toBe('Unable to initiate payment')
    })
  })
})
