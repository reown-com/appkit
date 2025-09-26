import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AccountState } from '../../src/controllers/ChainController'
import { ChainController } from '../../src/controllers/ChainController'
import { EventsController } from '../../src/controllers/EventsController'
import { ExchangeController } from '../../src/controllers/ExchangeController'
import { DEFAULT_STATE } from '../../src/controllers/ExchangeController'
import { OptionsController } from '../../src/controllers/OptionsController'
import { SnackController } from '../../src/controllers/SnackController'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil'
import * as ExchangeUtil from '../../src/utils/ExchangeUtil'
import type { ExchangeBuyStatus } from '../../src/utils/ExchangeUtil'

describe('ExchangeController', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should have default state', () => {
    expect(ExchangeController.state).toEqual(DEFAULT_STATE)
  })

  it('getTokenAmount returns computed amount', () => {
    ExchangeController.state.amount = 10
    ExchangeController.state.paymentAsset = {
      network: 'eip155:1',
      asset: 'native',
      metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      price: 2
    }

    const value = ExchangeController.getTokenAmount()
    expect(value).toBe(5)
  })

  it('setAmount updates amount and tokenAmount when price exists', () => {
    ExchangeController.state.paymentAsset = {
      network: 'eip155:1',
      asset: 'native',
      metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      price: 4
    }
    ExchangeController.setAmount(10)
    expect(ExchangeController.state.amount).toBe(10)
    expect(ExchangeController.state.tokenAmount).toBe(2.5)
  })

  describe('fetchExchanges', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: true },
        features: { pay: true }
      } as any)
      ChainController.state.activeCaipNetwork = {
        caipNetworkId: 'eip155:1',
        chainNamespace: 'eip155',
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: {
            http: ['https://rpc.ankr.com/eth']
          }
        }
      }
      vi.spyOn(ExchangeUtil, 'getExchanges').mockResolvedValue({
        exchanges: [],
        total: 0
      })
    })

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
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }
      await ExchangeController.fetchExchanges()

      expect(ExchangeUtil.getExchanges).toHaveBeenCalledWith({
        page: 0,
        asset: 'eip155:1/slip44:60',
        amount: '100'
      })
      expect(ExchangeController.state.exchanges).toEqual(mockResponse.exchanges.slice(0, 2))
      expect(ExchangeController.state.isLoading).toBe(false)
    })

    it('returns empty exchanges when no payment asset selected', async () => {
      ExchangeController.state.paymentAsset = null
      ExchangeController.state.amount = 100

      await ExchangeController.fetchExchanges()

      expect(ExchangeController.state.exchanges).toEqual([])
      expect(ExchangeController.state.isLoading).toBe(false)
    })

    it('shows error and rethrows on failure', async () => {
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }
      ExchangeController.state.amount = 100
      vi.spyOn(ExchangeUtil, 'getExchanges').mockRejectedValue(new Error('network error'))
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await expect(ExchangeController.fetchExchanges()).rejects.toThrow('Unable to get exchanges')
      expect(SnackController.showError).toHaveBeenCalledWith('Unable to get exchanges')
      expect(ExchangeController.state.isLoading).toBe(false)
    })

    it('does not fetch exchanges when pay with exchange is not enabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: false },
        features: { pay: false }
      } as any)
      vi.spyOn(ExchangeUtil, 'getExchanges')
      await ExchangeController.fetchExchanges()
      expect(ExchangeUtil.getExchanges).not.toHaveBeenCalled()
    })

    it('does not fetch exchanges when pay with exchange is not supported', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: true },
        features: { pay: true }
      } as any)
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { chainNamespace: 'bip122' }
      } as any)
      vi.spyOn(ExchangeUtil, 'getExchanges')
      await ExchangeController.fetchExchanges()
      expect(ExchangeUtil.getExchanges).not.toHaveBeenCalled()
    })
    it('fetches exchanges when pay is enabled but pay with exchange is not', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: false },
        features: { pay: true }
      } as any)
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { chainNamespace: 'eip155' }
      } as any)
      vi.spyOn(ExchangeUtil, 'getExchanges')
      await ExchangeController.fetchExchanges()
      expect(ExchangeUtil.getExchanges).toHaveBeenCalled()
    })
    it('fetches exchanges when pay with exchange is enabled but pay is not', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: true },
        features: { pay: false }
      } as any)
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { chainNamespace: 'eip155' }
      } as any)
      vi.spyOn(ExchangeUtil, 'getExchanges')
      await ExchangeController.fetchExchanges()
      expect(ExchangeUtil.getExchanges).toHaveBeenCalled()
    })
    it('fetches exchanges when payments is enabled and pay with exchange is not', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        remoteFeatures: { payWithExchange: false, payments: true },
        features: { pay: false }
      } as any)
      vi.spyOn(ExchangeUtil, 'getExchanges')
      await ExchangeController.fetchExchanges()
      expect(ExchangeUtil.getExchanges).toHaveBeenCalled()
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
      const hrefObject = {
        location: { href: '' }
      }

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0xabc'
      } as AccountState)
      ExchangeController.state.amount = 2
      ExchangeController.state.tokenAmount = 1.5
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }

      vi.spyOn(ExchangeController, 'getPayUrl').mockResolvedValue({
        url: 'https://pay.url',
        sessionId: 'sess-123'
      })
      vi.spyOn(CoreHelperUtil, 'returnOpenHref').mockReturnValue(hrefObject as any)

      await ExchangeController.handlePayWithExchange('ex1')

      expect(ExchangeController.getPayUrl).toHaveBeenCalledWith('ex1', {
        network: 'eip155:1',
        asset: 'native',
        amount: 1.5,
        recipient: '0xabc'
      })
      expect(ExchangeController.state.currentPayment?.status).toBe('IN_PROGRESS')
      expect(ExchangeController.state.currentPayment?.sessionId).toBe('sess-123')
      expect(ExchangeController.state.currentPayment?.exchangeId).toBe('ex1')
      expect(CoreHelperUtil.returnOpenHref).toHaveBeenCalledWith(
        '',
        'popupWindow',
        'scrollbar=yes,width=480,height=720'
      )
      expect(hrefObject.location.href).toBe('https://pay.url')
    })

    it('shows error if no account connected', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(SnackController.showError).toHaveBeenCalledWith('Unable to initiate payment')
      expect(ExchangeController.state.error).toBe('Unable to initiate payment')
    })

    it('shows error if no payment asset selected', async () => {
      ExchangeController.state.paymentAsset = null
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(SnackController.showError).toHaveBeenCalledWith('Unable to initiate payment')
      expect(ExchangeController.state.error).toBe('Unable to initiate payment')
    })

    it('shows error if pay url cannot be obtained', async () => {
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0xabc'
      } as AccountState)
      vi.spyOn(ExchangeController, 'getPayUrl').mockResolvedValue(undefined as any)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await ExchangeController.handlePayWithExchange('ex1')

      expect(SnackController.showError).toHaveBeenCalledWith('Unable to initiate payment')
      expect(ExchangeController.state.error).toBe('Unable to initiate payment')
    })
  })

  describe('getBuyStatus', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
      // Set up a current payment
      ExchangeController.state.currentPayment = {
        type: 'exchange',
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        status: 'IN_PROGRESS'
      }
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }
      ExchangeController.state.amount = 100
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0xabc123'
      } as AccountState)
    })

    it('returns success status and updates state correctly', async () => {
      const mockStatus = {
        status: 'SUCCESS' as ExchangeBuyStatus,
        txHash: '0xtxhash123'
      }
      vi.spyOn(ExchangeUtil, 'getBuyStatus').mockResolvedValue(mockStatus)
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

      const result = await ExchangeController.getBuyStatus('ex1', 'sess-123', 'payment-123')

      expect(ExchangeUtil.getBuyStatus).toHaveBeenCalledWith({
        sessionId: 'sess-123',
        exchangeId: 'ex1'
      })
      expect(ExchangeController.state.currentPayment?.status).toBe('SUCCESS')
      expect(ExchangeController.state.currentPayment?.result).toBe('0xtxhash123')
      expect(EventsController.sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_SUCCESS',
        properties: {
          source: 'fund-from-exchange',
          paymentId: 'payment-123',
          configuration: {
            network: 'eip155:1',
            asset: 'native',
            recipient: '0xabc123',
            amount: 100
          },
          currentPayment: {
            type: 'exchange',
            exchangeId: 'ex1',
            sessionId: 'sess-123',
            result: '0xtxhash123'
          }
        }
      })
      expect(result).toEqual(mockStatus)
    })

    it('returns failed status and sends error event', async () => {
      const mockStatus = {
        status: 'FAILED' as ExchangeBuyStatus,
        txHash: '0xfailedtx'
      }
      vi.spyOn(ExchangeUtil, 'getBuyStatus').mockResolvedValue(mockStatus)
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

      const result = await ExchangeController.getBuyStatus('ex1', 'sess-123', 'payment-123')

      expect(ExchangeController.state.currentPayment?.status).toBe('FAILED')
      expect(ExchangeController.state.currentPayment?.result).toBe('0xfailedtx')
      expect(EventsController.sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_ERROR',
        properties: {
          source: 'fund-from-exchange',
          paymentId: 'payment-123',
          configuration: {
            network: 'eip155:1',
            asset: 'native',
            recipient: '0xabc123',
            amount: 100
          },
          currentPayment: {
            type: 'exchange',
            exchangeId: 'ex1',
            sessionId: 'sess-123',
            result: '0xfailedtx'
          },
          message: 'Unable to initiate payment'
        }
      })
      expect(result).toEqual(mockStatus)
    })

    it('returns in progress status without sending event', async () => {
      const mockStatus = {
        status: 'IN_PROGRESS' as ExchangeBuyStatus,
        txHash: undefined
      }
      vi.spyOn(ExchangeUtil, 'getBuyStatus').mockResolvedValue(mockStatus)
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

      const result = await ExchangeController.getBuyStatus('ex1', 'sess-123', 'payment-123')

      expect(ExchangeController.state.currentPayment?.status).toBe('IN_PROGRESS')
      expect(ExchangeController.state.currentPayment?.result).toBeUndefined()
      expect(EventsController.sendEvent).not.toHaveBeenCalled()
      expect(result).toEqual(mockStatus)
    })

    it('throws error when no current payment exists', async () => {
      ExchangeController.state.currentPayment = undefined

      const result = await ExchangeController.getBuyStatus('ex1', 'sess-123', 'payment-123')

      expect(result).toEqual({
        status: 'UNKNOWN',
        txHash: ''
      })
    })

    it('returns UNKNOWN status when getBuyStatus utility throws error', async () => {
      vi.spyOn(ExchangeUtil, 'getBuyStatus').mockRejectedValue(new Error('Network error'))

      const result = await ExchangeController.getBuyStatus('ex1', 'sess-123', 'payment-123')

      expect(result).toEqual({
        status: 'UNKNOWN',
        txHash: ''
      })
    })
  })

  describe('waitUntilComplete', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      // Set up a current payment
      ExchangeController.state.currentPayment = {
        type: 'exchange',
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        status: 'IN_PROGRESS'
      }
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns immediately when getBuyStatus returns SUCCESS', async () => {
      const mockStatus = {
        status: 'SUCCESS' as ExchangeBuyStatus,
        txHash: '0xtxhash123'
      }
      vi.spyOn(ExchangeController, 'getBuyStatus').mockResolvedValue(mockStatus)

      const result = await ExchangeController.waitUntilComplete({
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        paymentId: 'payment-123'
      })

      expect(ExchangeController.getBuyStatus).toHaveBeenCalledWith('ex1', 'sess-123', 'payment-123')
      expect(result).toEqual(mockStatus)
    })

    it('returns immediately when getBuyStatus returns FAILED', async () => {
      const mockStatus = {
        status: 'FAILED' as ExchangeBuyStatus,
        txHash: '0xfailedtx'
      }
      vi.spyOn(ExchangeController, 'getBuyStatus').mockResolvedValue(mockStatus)

      const result = await ExchangeController.waitUntilComplete({
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        paymentId: 'payment-123'
      })

      expect(result).toEqual(mockStatus)
    })

    it('retries when getBuyStatus returns IN_PROGRESS then SUCCESS', async () => {
      const inProgressStatus = {
        status: 'IN_PROGRESS' as ExchangeBuyStatus,
        txHash: undefined
      }
      const successStatus = {
        status: 'SUCCESS' as ExchangeBuyStatus,
        txHash: '0xtxhash123'
      }

      vi.spyOn(ExchangeController, 'getBuyStatus')
        .mockResolvedValueOnce(inProgressStatus)
        .mockResolvedValueOnce(successStatus)

      const resultPromise = ExchangeController.waitUntilComplete({
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        paymentId: 'payment-123'
      })

      // Fast forward the timer to resolve the setTimeout
      await vi.advanceTimersByTimeAsync(5000)

      const result = await resultPromise

      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(2)
      expect(result).toEqual(successStatus)
    })

    it('throws error when retries are exhausted', async () => {
      const inProgressStatus = {
        status: 'IN_PROGRESS' as ExchangeBuyStatus,
        txHash: undefined
      }

      vi.spyOn(ExchangeController, 'getBuyStatus').mockResolvedValue(inProgressStatus)
      vi.spyOn(global, 'setTimeout').mockImplementation((handler: TimerHandler) => {
        if (typeof handler === 'function') {
          handler()
        }
        return 0 as any
      })
      // Start the promise but don't await it yet
      await expect(
        ExchangeController.waitUntilComplete({
          exchangeId: 'ex1',
          sessionId: 'sess-123',
          paymentId: 'payment-123',
          retries: 2
        })
      ).rejects.toThrow('Unable to get deposit status')

      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(3)
    })

    it('uses default retries value of 20', async () => {
      const inProgressStatus = {
        status: 'IN_PROGRESS' as ExchangeBuyStatus,
        txHash: undefined
      }
      const successStatus = {
        status: 'SUCCESS' as ExchangeBuyStatus,
        txHash: '0xtxhash123'
      }

      // Mock to return IN_PROGRESS for the first 19 calls, then SUCCESS
      const getBuyStatusSpy = vi.spyOn(ExchangeController, 'getBuyStatus')
      for (let i = 0; i < 19; i++) {
        getBuyStatusSpy.mockResolvedValueOnce(inProgressStatus)
      }
      getBuyStatusSpy.mockResolvedValueOnce(successStatus)

      const resultPromise = ExchangeController.waitUntilComplete({
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        paymentId: 'payment-123'
      })

      // Run all timers to completion
      await vi.runAllTimersAsync()

      const result = await resultPromise

      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(20)
      expect(result).toEqual(successStatus)
    })

    it('waits 5 seconds between retries', async () => {
      const inProgressStatus = {
        status: 'IN_PROGRESS' as ExchangeBuyStatus,
        txHash: undefined
      }
      const successStatus = {
        status: 'SUCCESS' as ExchangeBuyStatus,
        txHash: '0xtxhash123'
      }

      vi.spyOn(ExchangeController, 'getBuyStatus')
        .mockResolvedValueOnce(inProgressStatus)
        .mockResolvedValueOnce(successStatus)

      const resultPromise = ExchangeController.waitUntilComplete({
        exchangeId: 'ex1',
        sessionId: 'sess-123',
        paymentId: 'payment-123'
      })

      // Should be called once initially
      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(1)

      // Fast forward 4 seconds - should not call again yet
      await vi.advanceTimersByTimeAsync(4000)
      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(1)

      // Fast forward 1 more second - should call again
      await vi.advanceTimersByTimeAsync(1000)

      const result = await resultPromise
      expect(ExchangeController.getBuyStatus).toHaveBeenCalledTimes(2)
      expect(result).toEqual(successStatus)
    })
  })

  describe('asset management', () => {
    it('should set payment asset', () => {
      const asset = {
        network: 'eip155:1' as const,
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }

      ExchangeController.setPaymentAsset(asset)

      expect(ExchangeController.state.paymentAsset).toEqual(asset)
    })

    it('should get assets for network', async () => {
      // Mock the BlockchainApiController response
      vi.spyOn(ExchangeController, 'getAssetsImageAndPrice').mockResolvedValue([
        {
          fungibles: [
            {
              address: 'eip155:1/slip44:60',
              price: 2000,
              iconUrl: 'https://example.com/eth.png'
            }
          ]
        }
      ] as any)

      const assets = await ExchangeController.getAssetsForNetwork('eip155:1')

      expect(assets).toBeDefined()
      expect(ExchangeController.state.assets).toEqual(assets)
    })

    it('should reset state properly', () => {
      // Set some state
      ExchangeController.state.currentPayment = {
        type: 'exchange',
        exchangeId: 'test',
        sessionId: 'test-session'
      }
      ExchangeController.state.amount = 100
      ExchangeController.state.paymentAsset = {
        network: 'eip155:1',
        asset: 'native',
        metadata: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
      }

      ExchangeController.reset()

      expect(ExchangeController.state.currentPayment).toBeUndefined()
      expect(ExchangeController.state.amount).toBe(0)
      expect(ExchangeController.state.paymentAsset).toBeNull()
      expect(ExchangeController.state.isPaymentInProgress).toBe(false)
    })
  })
})
