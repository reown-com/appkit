import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetworkId, ConstantsUtil, NumberUtil, ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  ProviderController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { PayController } from '../../src/controllers/PayController'
import { AppKitPayError, AppKitPayErrorCodes, AppKitPayErrorMessages } from '../../src/types/errors'
import type { Exchange } from '../../src/types/exchange'
import type { PaymentOptions } from '../../src/types/options'
import * as ApiUtil from '../../src/utils/ApiUtil'
import * as AssetUtil from '../../src/utils/AssetUtil'
import * as PaymentUtil from '../../src/utils/PaymentUtil'

describe('PayController', () => {
  const mockPaymentOptions = {
    paymentAsset: {
      network: 'eip155:1',
      asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      metadata: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6
      }
    },
    recipient: '0x1234567890123456789012345678901234567890',
    amount: 10,
    openInNewTab: true,
    redirectUrl: {
      success: '',
      failure: ''
    },
    payWithExchange: 'coinbase'
  } as PaymentOptions

  const mockExchanges = [
    {
      id: 'coinbase',
      name: 'Coinbase',
      imageUrl: ''
    },
    {
      id: 'binance',
      name: 'Binance',
      imageUrl: ''
    }
  ] as Exchange[]

  const mockExchangesResponse = {
    exchanges: mockExchanges,
    total: 2
  }

  const mockPayUrlResponse = {
    url: '',
    sessionId: '123'
  }

  let eventsControllerSpy: ReturnType<typeof vi.spyOn>
  const mockPaymentId = 'mock-payment-id'

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetAllMocks()

    // Reset state
    PayController.state.isConfigured = false
    PayController.state.error = null
    PayController.state.isPaymentInProgress = false
    PayController.state.isLoading = false
    PayController.state.exchanges = []
    PayController.state.currentPayment = undefined
    PayController.state.analyticsSet = false

    // Mock ChainController state
    Object.defineProperty(ChainController.state, 'activeChain', {
      get: vi.fn(() => ConstantsUtil.CHAIN.EVM),
      configurable: true
    })

    Object.defineProperty(ChainController.state, 'activeCaipNetwork', {
      get: vi.fn(() => ({
        caipNetworkId: 'eip155:1'
      })),
      configurable: true
    })

    // Mock Account state
    Object.defineProperty(ChainController.state, 'activeCaipAddress', {
      get: vi.fn(() => 'eip155:1:0x1234567890123456789012345678901234567890'),
      configurable: true
    })

    // Mock modal and router controllers
    vi.spyOn(ModalController, 'open').mockResolvedValue(undefined)
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})

    // Mock EventsController
    eventsControllerSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    // Mock snack controller
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

    // Mock Connection Controller
    vi.spyOn(ConnectionController, 'sendTransaction').mockResolvedValue('0xTransactionHash')

    // Mock API calls
    vi.spyOn(ApiUtil, 'getExchanges').mockResolvedValue(mockExchangesResponse as any)
    vi.spyOn(ApiUtil, 'getPayUrl').mockResolvedValue(mockPayUrlResponse)
    vi.spyOn(ApiUtil, 'getQuote').mockResolvedValue({} as any)
    vi.spyOn(ApiUtil, 'getQuoteStatus').mockResolvedValue({ status: 'success' } as any)

    // Mock ProviderController
    vi.spyOn(ProviderController, 'subscribeProviders').mockImplementation(callback => {
      // Simulate a provider update - use any to bypass complex annoying type requirements
      callback({} as any)
      return () => {}
    })
    vi.spyOn(ProviderController, 'getProvider').mockReturnValue({} as any)

    // Mock ParseUtil
    vi.spyOn(ParseUtil, 'parseCaipAddress').mockReturnValue({
      chainId: '1',
      address: '0x1234567890123456789012345678901234567890',
      chainNamespace: 'eip155'
    } as any)

    // Mock PaymentUtil
    vi.spyOn(PaymentUtil, 'ensureCorrectNetwork').mockResolvedValue(undefined)
    vi.spyOn(PaymentUtil, 'processEvmNativePayment').mockResolvedValue(undefined)
    vi.spyOn(PaymentUtil, 'processEvmErc20Payment').mockResolvedValue(undefined)

    // Mock AssetUtil
    vi.spyOn(AssetUtil, 'formatCaip19Asset').mockReturnValue(
      'eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    )

    // Mock CoreHelperUtil
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => mockPaymentId)
    })
  })

  describe('setPaymentConfig', () => {
    it('should set payment config correctly', () => {
      PayController.setPaymentConfig(mockPaymentOptions)

      expect(PayController.state.paymentAsset).toEqual(mockPaymentOptions.paymentAsset)
      expect(PayController.state.recipient).toEqual(mockPaymentOptions.recipient)
      expect(PayController.state.amount).toEqual(mockPaymentOptions.amount)
      expect(PayController.state.openInNewTab).toEqual(mockPaymentOptions.openInNewTab)
      expect(PayController.state.redirectUrl).toEqual(mockPaymentOptions.redirectUrl)
      expect(PayController.state.payWithExchange).toEqual(mockPaymentOptions.payWithExchange)
      expect(PayController.state.error).toBeNull()
    })

    it('should throw error for invalid payment config', () => {
      const mockInvalidConfig = {} as any

      expect(() => PayController.setPaymentConfig(mockInvalidConfig)).toThrow(AppKitPayError)
    })
  })

  describe('handleOpenPay', () => {
    it('should configure payment, open modal, and send PAY_MODAL_OPEN event', async () => {
      const setPaymentConfigSpy = vi.spyOn(PayController, 'setPaymentConfig')
      const initializeAnalyticsSpy = vi.spyOn(PayController, 'initializeAnalytics')

      await PayController.handleOpenPay(mockPaymentOptions)

      expect(setPaymentConfigSpy).toHaveBeenCalledWith(mockPaymentOptions)
      expect(initializeAnalyticsSpy).toHaveBeenCalled()
      expect(PayController.state.isConfigured).toBe(true)
      expect(ModalController.open).toHaveBeenCalledWith({ view: 'Pay' })
      expect(eventsControllerSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_MODAL_OPEN',
        properties: {
          exchanges: [], // Initial state
          configuration: {
            network: mockPaymentOptions.paymentAsset.network,
            asset: mockPaymentOptions.paymentAsset.asset,
            recipient: mockPaymentOptions.recipient,
            amount: mockPaymentOptions.amount
          }
        }
      })
    })
  })

  describe('getPaymentAsset', () => {
    it('should return payment asset from state', () => {
      PayController.state.paymentAsset = mockPaymentOptions.paymentAsset

      const result = PayController.getPaymentAsset()

      expect(result).toEqual(mockPaymentOptions.paymentAsset)
    })
  })

  describe('fetchExchanges', () => {
    it('should fetch and set exchanges in state', async () => {
      await PayController.fetchExchanges()

      expect(ApiUtil.getExchanges).toHaveBeenCalledWith({
        page: 0
      })
      expect(PayController.state.exchanges).toEqual(mockExchanges.slice(0, 2))
      expect(PayController.state.isLoading).toBe(false)
    })

    it('should set isLoading to false even if fetch fails', async () => {
      vi.spyOn(ApiUtil, 'getExchanges').mockRejectedValueOnce(new Error('API error'))

      await expect(PayController.fetchExchanges()).rejects.toThrow('Unable to get exchanges')

      expect(PayController.state.isLoading).toBe(false)
    })
  })

  describe('getPayUrl', () => {
    const params = {
      network: mockPaymentOptions.paymentAsset.network as CaipNetworkId,
      asset: mockPaymentOptions.paymentAsset.asset,
      amount: mockPaymentOptions.amount,
      recipient: mockPaymentOptions.recipient
    }

    it('should return pay URL from API and send PAY_EXCHANGE_SELECTED event', async () => {
      const result = await PayController.getPayUrl('coinbase', params)

      expect(ApiUtil.getPayUrl).toHaveBeenCalledWith({
        exchangeId: 'coinbase',
        asset: 'eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: '10',
        recipient: 'eip155:1:0x1234567890123456789012345678901234567890'
      })
      expect(result).toEqual(mockPayUrlResponse)
      expect(eventsControllerSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_EXCHANGE_SELECTED',
        properties: {
          source: 'pay',
          exchange: {
            id: 'coinbase'
          },
          configuration: {
            network: params.network,
            asset: params.asset,
            recipient: params.recipient,
            amount: params.amount
          },
          currentPayment: {
            type: 'exchange',
            exchangeId: 'coinbase'
          },
          headless: false
        }
      })
    })

    it('should send PAY_INITIATED event when headless is true', async () => {
      await PayController.getPayUrl('coinbase', params, true)

      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'PAY_EXCHANGE_SELECTED'
        })
      )
      expect(eventsControllerSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_INITIATED',
        properties: {
          paymentId: mockPaymentId,
          source: 'pay',
          configuration: {
            network: params.network,
            asset: params.asset,
            recipient: params.recipient,
            amount: params.amount
          },
          currentPayment: {
            type: 'exchange',
            exchangeId: 'coinbase'
          }
        }
      })
    })

    it('should handle API errors', async () => {
      vi.spyOn(ApiUtil, 'getPayUrl').mockRejectedValueOnce(new Error('API error'))

      await expect(PayController.getPayUrl('coinbase', params)).rejects.toThrow('API error')
    })

    it('should handle asset not supported error', async () => {
      vi.spyOn(ApiUtil, 'getPayUrl').mockRejectedValueOnce(
        new Error('Asset is not supported by the selected exchange')
      )

      await expect(PayController.getPayUrl('coinbase', params)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.ASSET_NOT_SUPPORTED)
      )
    })
  })

  describe('validatePayConfig', () => {
    it('should not throw error for valid config', () => {
      expect(() => PayController.validatePayConfig(mockPaymentOptions)).not.toThrow()
    })

    it('should throw error for missing payment asset', () => {
      const invalidConfig = { ...mockPaymentOptions, paymentAsset: undefined } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
      )
    })

    it('should throw error for missing recipient', () => {
      const invalidConfig = {
        ...mockPaymentOptions,
        recipient: undefined // recipient is now a top-level property
      } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_RECIPIENT)
      )
    })

    it('should throw error for missing asset', () => {
      const invalidConfig = {
        ...mockPaymentOptions,
        paymentAsset: { ...mockPaymentOptions.paymentAsset, asset: undefined }
      } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_ASSET)
      )
    })

    it('should throw error for missing amount', () => {
      const invalidConfig = {
        ...mockPaymentOptions,
        amount: undefined // amount is now a top-level property
      } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_AMOUNT)
      )
    })

    it('should throw error for zero amount', () => {
      const invalidConfig = {
        ...mockPaymentOptions,
        amount: 0 // amount should be positive
      } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_AMOUNT)
      )
    })

    it('should throw error for negative amount', () => {
      const invalidConfig = {
        ...mockPaymentOptions,
        amount: -10 // amount should be positive
      } as any

      expect(() => PayController.validatePayConfig(invalidConfig)).toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_AMOUNT)
      )
    })
  })

  describe('handlePayWithExchange', () => {
    it('should get pay URL and return object for opening in new tab', async () => {
      PayController.state.openInNewTab = true
      PayController.setPaymentConfig(mockPaymentOptions)
      PayController.initializeAnalytics()
      PayController.state.currentPayment = {
        type: 'exchange',
        status: 'UNKNOWN',
        exchangeId: 'coinbase'
      }

      const getPayUrlSpy = vi.spyOn(PayController, 'getPayUrl')
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      const result = await PayController.handlePayWithExchange('coinbase')

      expect(getPayUrlSpy).toHaveBeenCalledWith('coinbase', {
        network: mockPaymentOptions.paymentAsset.network,
        asset: mockPaymentOptions.paymentAsset.asset,
        amount: mockPaymentOptions.amount,
        recipient: mockPaymentOptions.recipient
      })
      expect(PayController.state.isPaymentInProgress).toBe(true)
      expect(PayController.state.currentPayment).toEqual({
        type: 'exchange',
        exchangeId: 'coinbase',
        sessionId: mockPayUrlResponse.sessionId,
        status: 'IN_PROGRESS'
      })
      expect(result).toEqual({
        url: mockPayUrlResponse.url,
        openInNewTab: true
      })
      expect(ModalController.open).not.toHaveBeenCalled()
      expect(openHrefSpy).not.toHaveBeenCalled()
      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_INITIATED',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: mockPaymentOptions.paymentAsset.asset,
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'exchange',
              exchangeId: 'coinbase',
              sessionId: mockPayUrlResponse.sessionId,
              result: undefined
            })
          })
        })
      )
    })

    it('should get pay URL and return object for opening in same tab', async () => {
      PayController.setPaymentConfig(mockPaymentOptions)
      PayController.state.openInNewTab = false

      const getPayUrlSpy = vi
        .spyOn(PayController, 'getPayUrl')
        .mockResolvedValue(mockPayUrlResponse)

      const routerPushSpy = vi.spyOn(RouterController, 'push')
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')
      const snackErrorSpy = vi.spyOn(SnackController, 'showError')

      const result = await PayController.handlePayWithExchange('coinbase')

      expect(getPayUrlSpy).toHaveBeenCalledWith('coinbase', {
        network: mockPaymentOptions.paymentAsset.network,
        asset: mockPaymentOptions.paymentAsset.asset,
        amount: mockPaymentOptions.amount,
        recipient: mockPaymentOptions.recipient
      })
      expect(PayController.state.isPaymentInProgress).toBe(true)
      expect(PayController.state.currentPayment).toEqual({
        type: 'exchange',
        exchangeId: 'coinbase',
        sessionId: mockPayUrlResponse.sessionId,
        status: 'IN_PROGRESS'
      })
      expect(result).toEqual({
        url: mockPayUrlResponse.url,
        openInNewTab: false
      })
      expect(snackErrorSpy).not.toHaveBeenCalled()
      expect(routerPushSpy).not.toHaveBeenCalled()
      expect(openHrefSpy).not.toHaveBeenCalled()
    })

    it('should set error state and show snackbar if unable to get pay URL', async () => {
      PayController.setPaymentConfig(mockPaymentOptions)
      vi.spyOn(PayController, 'getPayUrl').mockResolvedValue(null as any)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      const result = await PayController.handlePayWithExchange('coinbase')

      expect(result).toBeNull()
      expect(PayController.state.error).toBe(AppKitPayErrorMessages.UNABLE_TO_INITIATE_PAYMENT)
      expect(PayController.state.isPaymentInProgress).toBe(false)
      expect(SnackController.showError).toHaveBeenCalledWith(
        AppKitPayErrorMessages.UNABLE_TO_INITIATE_PAYMENT
      )
    })

    it('should handle generic error during exchange payment', async () => {
      PayController.setPaymentConfig(mockPaymentOptions)
      const genericError = new Error('Generic Error')
      vi.spyOn(PayController, 'getPayUrl').mockRejectedValueOnce(genericError)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      await PayController.handlePayWithExchange('coinbase')

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
      expect(SnackController.showError).toHaveBeenCalledWith(
        AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      )
    })
  })

  describe('openPayUrl', () => {
    const params = {
      network: mockPaymentOptions.paymentAsset.network as CaipNetworkId,
      asset: mockPaymentOptions.paymentAsset.asset,
      amount: mockPaymentOptions.amount,
      recipient: mockPaymentOptions.recipient
    }
    const exchangeId = 'coinbase'
    const mockUrl = mockPayUrlResponse.url

    it('should get pay URL and open it in new tab by default', async () => {
      const getPayUrlSpy = vi
        .spyOn(PayController, 'getPayUrl')
        .mockResolvedValue(mockPayUrlResponse)
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      await PayController.openPayUrl({ exchangeId }, params)

      expect(getPayUrlSpy).toHaveBeenCalledWith(exchangeId, params, false)
      expect(openHrefSpy).toHaveBeenCalledWith(mockUrl, '_blank')
      expect(SnackController.showError).not.toHaveBeenCalled()
    })

    it('should get pay URL and open it in same tab when openInNewTab is false', async () => {
      const getPayUrlSpy = vi
        .spyOn(PayController, 'getPayUrl')
        .mockResolvedValue(mockPayUrlResponse)
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      await PayController.openPayUrl({ exchangeId, openInNewTab: false }, params)

      expect(getPayUrlSpy).toHaveBeenCalledWith(exchangeId, params, false)
      expect(openHrefSpy).toHaveBeenCalledWith(mockUrl, '_self')
      expect(SnackController.showError).not.toHaveBeenCalled()
    })

    it('should handle error if getPayUrl returns null', async () => {
      const getPayUrlSpy = vi.spyOn(PayController, 'getPayUrl').mockResolvedValue(null as any)
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      await expect(PayController.openPayUrl({ exchangeId }, params)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)
      )

      expect(getPayUrlSpy).toHaveBeenCalledWith(exchangeId, params, false)
      expect(openHrefSpy).not.toHaveBeenCalled()
      expect(PayController.state.error).toBe(AppKitPayErrorMessages.UNABLE_TO_GET_PAY_URL)
    })

    it('should handle AppKitPayError from getPayUrl', async () => {
      const originalError = new AppKitPayError(AppKitPayErrorCodes.ASSET_NOT_SUPPORTED)
      const getPayUrlSpy = vi.spyOn(PayController, 'getPayUrl').mockRejectedValue(originalError)
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      await expect(PayController.openPayUrl({ exchangeId }, params)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)
      )

      expect(getPayUrlSpy).toHaveBeenCalledWith(exchangeId, params, false)
      expect(openHrefSpy).not.toHaveBeenCalled()
      expect(PayController.state.error).toBe(AppKitPayErrorMessages.ASSET_NOT_SUPPORTED)
    })

    it('should handle generic error from getPayUrl', async () => {
      const originalError = new Error('Generic network error')
      const getPayUrlSpy = vi.spyOn(PayController, 'getPayUrl').mockRejectedValue(originalError)
      const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref')

      await expect(PayController.openPayUrl({ exchangeId }, params)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)
      )

      expect(getPayUrlSpy).toHaveBeenCalledWith(exchangeId, params, false)
      expect(openHrefSpy).not.toHaveBeenCalled()
      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
    })
  })

  describe('getExchanges', () => {
    it('should return exchanges from state', () => {
      PayController.state.exchanges = mockExchanges

      const result = PayController.getExchanges()

      expect(result).toEqual(mockExchanges)
    })
  })

  describe('getAvailableExchanges', () => {
    it('should call getExchanges with default page 0 and return exchanges', async () => {
      const result = await PayController.getAvailableExchanges()

      expect(ApiUtil.getExchanges).toHaveBeenCalledWith({ page: 0 })
      expect(result).toEqual(mockExchangesResponse)
    })

    it('should call getExchanges with the specified page number and return exchanges', async () => {
      const page = 1
      const result = await PayController.getAvailableExchanges({ page })

      expect(ApiUtil.getExchanges).toHaveBeenCalledWith({ page })
      expect(result).toEqual(mockExchangesResponse)
    })

    it('should throw AppKitPayError if getExchanges fails', async () => {
      const apiError = new Error('API Error')
      vi.spyOn(ApiUtil, 'getExchanges').mockRejectedValueOnce(apiError)

      await expect(PayController.getAvailableExchanges()).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)
      )
      expect(ApiUtil.getExchanges).toHaveBeenCalledWith({ page: 0 })
    })
  })

  describe('PayController.getBuyStatus', () => {
    const exchangeId = 'coinbase'
    const sessionId = 'test-session-id'

    beforeEach(() => {
      PayController.state.paymentAsset = mockPaymentOptions.paymentAsset
      PayController.state.recipient = mockPaymentOptions.recipient
      PayController.state.amount = mockPaymentOptions.amount
      PayController.state.currentPayment = {
        type: 'exchange',
        exchangeId,
        sessionId,
        status: 'IN_PROGRESS'
      }
    })

    it('should send PAY_SUCCESS event if API returns SUCCESS status', async () => {
      const mockSuccessStatus = { status: 'SUCCESS', txHash: '0x123abc' }
      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue(mockSuccessStatus as any)

      const result = await PayController.getBuyStatus(exchangeId, sessionId)

      expect(result).toEqual(mockSuccessStatus)
      expect(ApiUtil.getBuyStatus).toHaveBeenCalledWith({ exchangeId, sessionId })
      expect(eventsControllerSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_SUCCESS',
        properties: {
          paymentId: mockPaymentId,
          source: 'pay',
          configuration: {
            network: mockPaymentOptions.paymentAsset.network,
            asset: mockPaymentOptions.paymentAsset.asset,
            recipient: mockPaymentOptions.recipient,
            amount: mockPaymentOptions.amount
          },
          currentPayment: {
            type: 'exchange',
            exchangeId,
            sessionId,
            result: mockSuccessStatus.txHash
          }
        }
      })
    })

    it('should send PAY_ERROR event if API returns FAILED status', async () => {
      const mockFailedStatus = { status: 'FAILED', txHash: null }
      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue(mockFailedStatus as any)

      const result = await PayController.getBuyStatus(exchangeId, sessionId)

      expect(result).toEqual(mockFailedStatus)
      expect(ApiUtil.getBuyStatus).toHaveBeenCalledWith({ exchangeId, sessionId })
      expect(eventsControllerSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'PAY_ERROR',
        properties: {
          paymentId: mockPaymentId,
          source: 'pay',
          configuration: {
            network: mockPaymentOptions.paymentAsset.network,
            asset: mockPaymentOptions.paymentAsset.asset,
            recipient: mockPaymentOptions.recipient,
            amount: mockPaymentOptions.amount
          },
          currentPayment: {
            type: 'exchange',
            exchangeId,
            sessionId,
            result: mockFailedStatus.txHash
          },
          message: 'Unknown error'
        }
      })
    })

    it('should not send event if status is neither SUCCESS nor FAILED', async () => {
      const mockInProgressStatus = { status: 'IN_PROGRESS', txHash: null }
      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue(mockInProgressStatus as any)

      await PayController.getBuyStatus(exchangeId, sessionId)

      expect(eventsControllerSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ event: 'PAY_SUCCESS' })
      )
      expect(eventsControllerSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ event: 'PAY_ERROR' })
      )
    })

    it('should throw AppKitPayError if ApiUtil.getBuyStatus fails', async () => {
      vi.spyOn(ApiUtil, 'getBuyStatus').mockRejectedValueOnce(new Error('API Error'))

      await expect(PayController.getBuyStatus(exchangeId, sessionId)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_BUY_STATUS)
      )
    })
  })

  describe('onTransfer', () => {
    const mockTransferParams = {
      chainNamespace: ConstantsUtil.CHAIN.EVM,
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 10,
      paymentAsset: mockPaymentOptions.paymentAsset
    }

    const mockTargetNetwork = {
      id: 1,
      name: 'Ethereum',
      chainId: 1,
      chainNamespace: 'eip155' as const,
      caipNetworkId: 'eip155:1' as const,
      imageId: 'ethereum',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: {
        default: {
          http: ['']
        }
      }
    }

    beforeEach(() => {
      vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([mockTargetNetwork])
      vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)
    })

    it('should handle EVM native token transfer successfully', async () => {
      const nativeParams = {
        ...mockTransferParams,
        paymentAsset: {
          ...mockPaymentOptions.paymentAsset,
          asset: 'native'
        }
      }

      vi.spyOn(PaymentUtil, 'processEvmNativePayment').mockResolvedValue('0xTransactionHash')

      await PayController.onTransfer(nativeParams)

      expect(PaymentUtil.processEvmNativePayment).toHaveBeenCalledWith(
        nativeParams.paymentAsset,
        ConstantsUtil.CHAIN.EVM,
        {
          recipient: mockTransferParams.toAddress,
          amount: mockTransferParams.amount,
          fromAddress: mockTransferParams.fromAddress
        }
      )
      expect(PayController.state.currentPayment?.status).toBe('SUCCESS')
      expect(PayController.state.currentPayment?.result).toBe('0xTransactionHash')
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should handle EVM ERC20 token transfer successfully', async () => {
      vi.spyOn(PaymentUtil, 'processEvmErc20Payment').mockResolvedValue('0xERC20TxHash')

      await PayController.onTransfer(mockTransferParams)

      expect(PaymentUtil.processEvmErc20Payment).toHaveBeenCalledWith(
        mockTransferParams.paymentAsset,
        {
          recipient: mockTransferParams.toAddress,
          amount: mockTransferParams.amount,
          fromAddress: mockTransferParams.fromAddress
        }
      )
      expect(PayController.state.currentPayment?.status).toBe('SUCCESS')
      expect(PayController.state.currentPayment?.result).toBe('0xERC20TxHash')
    })

    it('should handle Solana native token transfer successfully', async () => {
      const solanaParams = {
        chainNamespace: ConstantsUtil.CHAIN.SOLANA,
        fromAddress: 'SolanaAddress123',
        toAddress: 'SolanaAddress456',
        amount: 1,
        paymentAsset: {
          ...mockPaymentOptions.paymentAsset,
          asset: 'native'
        }
      }

      vi.spyOn(PaymentUtil, 'processSolanaPayment').mockResolvedValue('SolanaTxSignature')

      await PayController.onTransfer(solanaParams)

      expect(PaymentUtil.processSolanaPayment).toHaveBeenCalledWith(ConstantsUtil.CHAIN.SOLANA, {
        recipient: solanaParams.toAddress,
        amount: solanaParams.amount,
        fromAddress: solanaParams.fromAddress,
        tokenMint: undefined
      })
      expect(PayController.state.currentPayment?.status).toBe('SUCCESS')
      expect(PayController.state.currentPayment?.result).toBe('SolanaTxSignature')
    })

    it('should handle Solana SPL token transfer successfully', async () => {
      const solanaSplParams = {
        chainNamespace: ConstantsUtil.CHAIN.SOLANA,
        fromAddress: 'SolanaAddress123',
        toAddress: 'SolanaAddress456',
        amount: 10,
        paymentAsset: {
          ...mockPaymentOptions.paymentAsset,
          asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        }
      }

      vi.spyOn(PaymentUtil, 'processSolanaPayment').mockResolvedValue('SolanaSPLTxSignature')

      await PayController.onTransfer(solanaSplParams)

      expect(PaymentUtil.processSolanaPayment).toHaveBeenCalledWith(ConstantsUtil.CHAIN.SOLANA, {
        recipient: solanaSplParams.toAddress,
        amount: solanaSplParams.amount,
        fromAddress: solanaSplParams.fromAddress,
        tokenMint: solanaSplParams.paymentAsset.asset
      })
      expect(PayController.state.currentPayment?.status).toBe('SUCCESS')
    })

    it('should switch network if not on target network', async () => {
      Object.defineProperty(ChainController.state, 'activeCaipNetwork', {
        get: vi.fn(() => ({
          caipNetworkId: 'eip155:137'
        })),
        configurable: true
      })

      vi.spyOn(PaymentUtil, 'processEvmNativePayment').mockResolvedValue('0xHash')

      await PayController.onTransfer({
        ...mockTransferParams,
        paymentAsset: {
          ...mockPaymentOptions.paymentAsset,
          asset: 'native'
        }
      })

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(mockTargetNetwork)
    })

    it('should not switch network if already on target network', async () => {
      Object.defineProperty(ChainController.state, 'activeCaipNetwork', {
        get: vi.fn(() => ({
          caipNetworkId: 'eip155:1'
        })),
        configurable: true
      })

      vi.spyOn(PaymentUtil, 'processEvmNativePayment').mockResolvedValue('0xHash')

      await PayController.onTransfer({
        ...mockTransferParams,
        paymentAsset: {
          ...mockPaymentOptions.paymentAsset,
          asset: 'native'
        }
      })

      expect(ChainController.switchActiveNetwork).not.toHaveBeenCalled()
    })

    it('should handle payment processing errors', async () => {
      vi.spyOn(PaymentUtil, 'processEvmErc20Payment').mockRejectedValueOnce(
        new Error('Payment failed')
      )

      await expect(PayController.onTransfer(mockTransferParams)).rejects.toThrow('Payment failed')

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
      expect(PayController.state.currentPayment?.status).toBe('FAILED')
      expect(SnackController.showError).toHaveBeenCalledWith(
        AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      )
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should handle AppKitPayError specifically', async () => {
      const payError = new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)

      vi.spyOn(PaymentUtil, 'processEvmErc20Payment').mockRejectedValueOnce(payError)

      await expect(PayController.onTransfer(mockTransferParams)).rejects.toThrow(payError)

      expect(PayController.state.error).toBe(payError.message)
      expect(PayController.state.currentPayment?.status).toBe('FAILED')
    })

    it('should throw error for unsupported chain namespace', async () => {
      const unsupportedParams = {
        ...mockTransferParams,
        chainNamespace: 'unsupported' as any
      }

      await expect(PayController.onTransfer(unsupportedParams)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
      )

      expect(PayController.state.currentPayment?.status).toBe('FAILED')
    })

    it('should throw error if target network not found', async () => {
      vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([])

      await expect(PayController.onTransfer(mockTransferParams)).rejects.toThrow(
        'Target network not found'
      )

      expect(PayController.state.currentPayment?.status).toBe('FAILED')
    })

    it('should return early if payment already in progress', async () => {
      PayController.state.isPaymentInProgress = true

      await PayController.onTransfer(mockTransferParams)

      expect(PaymentUtil.processEvmErc20Payment).not.toHaveBeenCalled()
      expect(PaymentUtil.processEvmNativePayment).not.toHaveBeenCalled()
    })
  })

  describe('onSendTransaction', () => {
    const mockTransactionStep = {
      requestId: 'test-request-id',
      type: 'transaction' as const,
      transaction: {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        data: '0xabcdef',
        value: '1000000000000000000'
      }
    }

    const mockTargetNetwork = {
      id: 1,
      name: 'Ethereum',
      chainId: 1,
      chainNamespace: 'eip155' as const,
      caipNetworkId: 'eip155:1' as const,
      imageId: 'ethereum',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: {
        default: {
          http: ['https://ethereum.publicnode.com']
        }
      }
    }

    beforeEach(() => {
      PayController.state.paymentAsset = mockPaymentOptions.paymentAsset
      vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([mockTargetNetwork])
      vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)
    })

    it('should send EVM transaction successfully', async () => {
      await PayController.onSendTransaction({
        namespace: ConstantsUtil.CHAIN.EVM,
        transactionStep: mockTransactionStep
      })

      expect(ConnectionController.sendTransaction).toHaveBeenCalledWith({
        address: mockTransactionStep.transaction.from,
        to: mockTransactionStep.transaction.to,
        data: mockTransactionStep.transaction.data,
        value: BigInt(mockTransactionStep.transaction.value),
        chainNamespace: ConstantsUtil.CHAIN.EVM
      })
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should initiate payment before sending transaction', async () => {
      const initiatePaymentSpy = vi.spyOn(PayController, 'initiatePayment')

      await PayController.onSendTransaction({
        namespace: ConstantsUtil.CHAIN.EVM,
        transactionStep: mockTransactionStep
      })

      expect(initiatePaymentSpy).toHaveBeenCalled()
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should switch network if not on target network', async () => {
      Object.defineProperty(ChainController.state, 'activeCaipNetwork', {
        get: vi.fn(() => ({
          caipNetworkId: 'eip155:137'
        })),
        configurable: true
      })

      await PayController.onSendTransaction({
        namespace: ConstantsUtil.CHAIN.EVM,
        transactionStep: mockTransactionStep
      })

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(mockTargetNetwork)
    })

    it('should not switch network if already on target network', async () => {
      Object.defineProperty(ChainController.state, 'activeCaipNetwork', {
        get: vi.fn(() => ({
          caipNetworkId: 'eip155:1'
        })),
        configurable: true
      })

      await PayController.onSendTransaction({
        namespace: ConstantsUtil.CHAIN.EVM,
        transactionStep: mockTransactionStep
      })

      expect(ChainController.switchActiveNetwork).not.toHaveBeenCalled()
    })

    it('should handle transaction errors', async () => {
      vi.spyOn(ConnectionController, 'sendTransaction').mockRejectedValueOnce(
        new Error('Transaction failed')
      )

      await expect(
        PayController.onSendTransaction({
          namespace: ConstantsUtil.CHAIN.EVM,
          transactionStep: mockTransactionStep
        })
      ).rejects.toThrow('Transaction failed')

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
      expect(SnackController.showError).toHaveBeenCalledWith(
        AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      )
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should handle AppKitPayError specifically', async () => {
      const payError = new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)

      vi.spyOn(ConnectionController, 'sendTransaction').mockRejectedValueOnce(payError)

      await expect(
        PayController.onSendTransaction({
          namespace: ConstantsUtil.CHAIN.EVM,
          transactionStep: mockTransactionStep
        })
      ).rejects.toThrow(payError)

      expect(PayController.state.error).toBe(payError.message)
    })

    it('should throw error if target network not found', async () => {
      vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue([])

      await expect(
        PayController.onSendTransaction({
          namespace: ConstantsUtil.CHAIN.EVM,
          transactionStep: mockTransactionStep
        })
      ).rejects.toThrow('Target network not found')

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
    })
  })

  describe('fetchQuote', () => {
    const mockQuoteParams = {
      amount: '1000000',
      address: '0x1234567890123456789012345678901234567890',
      sourceToken: mockPaymentOptions.paymentAsset,
      toToken: mockPaymentOptions.paymentAsset,
      recipient: '0x0987654321098765432109876543210987654321'
    }

    const mockQuote = {
      origin: {
        amount: '1000000',
        currency: mockPaymentOptions.paymentAsset
      },
      destination: {
        amount: '1000000',
        currency: mockPaymentOptions.paymentAsset
      },
      steps: [],
      fees: [],
      timeInSeconds: 30
    }

    beforeEach(() => {
      PayController.resetQuoteState()
    })

    it('should fetch quote successfully', async () => {
      vi.spyOn(ApiUtil, 'getQuote').mockResolvedValue(mockQuote as any)

      await PayController.fetchQuote(mockQuoteParams)

      expect(ApiUtil.getQuote).toHaveBeenCalledWith({
        amount: mockQuoteParams.amount,
        address: mockQuoteParams.address,
        sourceToken: mockQuoteParams.sourceToken,
        toToken: mockQuoteParams.toToken,
        recipient: mockQuoteParams.recipient
      })
      expect(PayController.state.quote).toEqual(mockQuote)
      expect(PayController.state.isFetchingQuote).toBe(false)
    })

    it('should reset quote state before fetching', async () => {
      PayController.state.quoteError = 'Previous error'
      PayController.state.quote = {} as any

      vi.spyOn(ApiUtil, 'getQuote').mockResolvedValue(mockQuote as any)
      const resetSpy = vi.spyOn(PayController, 'resetQuoteState')

      await PayController.fetchQuote(mockQuoteParams)

      expect(resetSpy).toHaveBeenCalled()
    })

    it('should set isFetchingQuote to true during fetch', async () => {
      vi.spyOn(ApiUtil, 'getQuote').mockImplementation(
        () =>
          new Promise(resolve => {
            expect(PayController.state.isFetchingQuote).toBe(true)
            setTimeout(() => resolve(mockQuote as any), 10)
          })
      )

      await PayController.fetchQuote(mockQuoteParams)

      expect(PayController.state.isFetchingQuote).toBe(false)
    })

    it('should not include address when selectedExchange is set', async () => {
      PayController.state.selectedExchange = mockExchanges[0]
      vi.spyOn(ApiUtil, 'getQuote').mockResolvedValue(mockQuote as any)
      vi.spyOn(PaymentUtil, 'getTransferStep').mockReturnValue(null)

      await PayController.fetchQuote(mockQuoteParams)

      expect(ApiUtil.getQuote).toHaveBeenCalledWith({
        amount: mockQuoteParams.amount,
        address: undefined,
        sourceToken: mockQuoteParams.sourceToken,
        toToken: mockQuoteParams.toToken,
        recipient: mockQuoteParams.recipient
      })
    })

    it('should generate exchange URL when selectedExchange has transfer step', async () => {
      const mockTransferStep = {
        requestId: 'test-request-id',
        type: 'deposit' as const,
        deposit: {
          amount: '1000000',
          currency: 'USDC',
          receiver: '0xReceiverAddress'
        }
      }

      const quoteWithSteps = {
        ...mockQuote,
        steps: [mockTransferStep]
      }

      PayController.state.selectedExchange = mockExchanges[0]
      vi.spyOn(ApiUtil, 'getQuote').mockResolvedValue(quoteWithSteps as any)
      vi.spyOn(PaymentUtil, 'getTransferStep').mockReturnValue(mockTransferStep)
      const generateExchangeUrlSpy = vi
        .spyOn(PayController, 'generateExchangeUrlForQuote')
        .mockResolvedValue(undefined)

      await PayController.fetchQuote(mockQuoteParams)

      expect(generateExchangeUrlSpy).toHaveBeenCalledWith({
        exchangeId: mockExchanges[0]!.id,
        paymentAsset: mockQuoteParams.sourceToken,
        amount: NumberUtil.formatNumber(mockQuoteParams.amount, {
          decimals: mockQuoteParams.sourceToken.metadata.decimals ?? 0,
          round: 8
        }).toString(),
        recipient: `${mockQuoteParams.sourceToken.network}:${mockTransferStep.deposit.receiver}`
      })
    })

    it('should handle API errors', async () => {
      vi.spyOn(ApiUtil, 'getQuote').mockRejectedValueOnce(new Error('API error'))

      await expect(PayController.fetchQuote(mockQuoteParams)).rejects.toThrow(
        new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE)
      )

      expect(PayController.state.quoteError).toBe(AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE)
      expect(SnackController.showError).toHaveBeenCalledWith(
        AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE
      )
      expect(PayController.state.isFetchingQuote).toBe(false)
    })

    it('should extract error message from Response cause', async () => {
      const mockResponse = new Response(JSON.stringify({ error: 'Custom error message' }), {
        status: 400
      })

      const errorWithCause = new Error('Fetch failed')

      Object.defineProperty(errorWithCause, 'cause', {
        value: mockResponse,
        configurable: true
      })

      vi.spyOn(ApiUtil, 'getQuote').mockRejectedValueOnce(errorWithCause)

      await expect(PayController.fetchQuote(mockQuoteParams)).rejects.toThrow()

      expect(PayController.state.quoteError).toBe('Custom error message')
      expect(SnackController.showError).toHaveBeenCalledWith('Custom error message')
    })

    it('should use default error message if response parsing fails', async () => {
      const mockResponse = new Response('Invalid JSON', { status: 400 })
      const errorWithCause = new Error('Fetch failed')
      Object.defineProperty(errorWithCause, 'cause', {
        value: mockResponse,
        configurable: true
      })

      vi.spyOn(ApiUtil, 'getQuote').mockRejectedValueOnce(errorWithCause)

      await expect(PayController.fetchQuote(mockQuoteParams)).rejects.toThrow()

      expect(PayController.state.quoteError).toBe(AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE)
    })
  })

  describe('fetchQuoteStatus', () => {
    beforeEach(() => {
      PayController.state.selectedExchange = undefined
      PayController.state.exchangeSessionId = undefined
    })

    it('should fetch quote status successfully', async () => {
      vi.spyOn(ApiUtil, 'getQuoteStatus').mockResolvedValue({ status: 'success' } as any)

      await PayController.fetchQuoteStatus({ requestId: 'test-request-id' })

      expect(ApiUtil.getQuoteStatus).toHaveBeenCalledWith({ requestId: 'test-request-id' })
      expect(PayController.state.quoteStatus).toBe('success')
    })

    it('should handle different quote statuses from API', async () => {
      const statuses: Array<{ status: string }> = [
        { status: 'waiting' },
        { status: 'pending' },
        { status: 'success' },
        { status: 'failure' },
        { status: 'timeout' },
        { status: 'refund' }
      ]

      for (const statusObj of statuses) {
        vi.spyOn(ApiUtil, 'getQuoteStatus').mockResolvedValue(statusObj as any)

        await PayController.fetchQuoteStatus({ requestId: 'test-request-id' })

        expect(PayController.state.quoteStatus).toBe(statusObj.status)
      }
    })

    it('should handle direct transfer with exchange - success status', async () => {
      PayController.state.selectedExchange = mockExchanges[0]
      PayController.state.exchangeSessionId = 'test-session-id'

      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue({
        status: 'SUCCESS',
        txHash: '0xSuccess'
      } as any)

      await PayController.fetchQuoteStatus({ requestId: 'direct-transfer' })

      expect(ApiUtil.getBuyStatus).toHaveBeenCalledWith({
        exchangeId: mockExchanges[0]!.id,
        sessionId: 'test-session-id'
      })
      expect(PayController.state.quoteStatus).toBe('success')
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should handle direct transfer with exchange - failure status', async () => {
      PayController.state.selectedExchange = mockExchanges[0]
      PayController.state.exchangeSessionId = 'test-session-id'

      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue({
        status: 'FAILED',
        txHash: null
      } as any)

      await PayController.fetchQuoteStatus({ requestId: 'direct-transfer' })

      expect(PayController.state.quoteStatus).toBe('failure')
      expect(PayController.state.isPaymentInProgress).toBe(false)
    })

    it('should handle direct transfer with exchange - in progress status', async () => {
      PayController.state.selectedExchange = mockExchanges[0]
      PayController.state.exchangeSessionId = 'test-session-id'

      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue({
        status: 'IN_PROGRESS',
        txHash: null
      } as any)

      await PayController.fetchQuoteStatus({ requestId: 'direct-transfer' })

      expect(PayController.state.quoteStatus).toBe('waiting')
    })

    it('should handle direct transfer with exchange - unknown status', async () => {
      PayController.state.selectedExchange = mockExchanges[0]
      PayController.state.exchangeSessionId = 'test-session-id'

      vi.spyOn(ApiUtil, 'getBuyStatus').mockResolvedValue({
        status: 'UNKNOWN',
        txHash: null
      } as any)

      await PayController.fetchQuoteStatus({ requestId: 'direct-transfer' })

      expect(PayController.state.quoteStatus).toBe('waiting')
    })

    it('should handle direct transfer without exchange', async () => {
      await PayController.fetchQuoteStatus({ requestId: 'direct-transfer' })

      expect(PayController.state.quoteStatus).toBe('success')
    })

    it('should handle API errors', async () => {
      vi.spyOn(ApiUtil, 'getQuoteStatus').mockRejectedValueOnce(new Error('API error'))

      await expect(
        PayController.fetchQuoteStatus({ requestId: 'test-request-id' })
      ).rejects.toThrow(new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE_STATUS))

      expect(PayController.state.quoteStatus).toBe('failure')
    })
  })

  describe('initiatePayment', () => {
    it('should set isPaymentInProgress to true and generate paymentId', () => {
      PayController.state.isPaymentInProgress = false
      PayController.state.paymentId = undefined

      PayController.initiatePayment()

      expect(PayController.state.isPaymentInProgress).toBe(true)
      expect(PayController.state.paymentId).toBe(mockPaymentId)
    })
  })

  describe('initializeAnalytics', () => {
    it('should set analyticsSet and subscribe to isPaymentInProgress', () => {
      PayController.state.analyticsSet = false
      const subscribeKeySpy = vi.spyOn(PayController, 'subscribeKey')

      PayController.initializeAnalytics()

      expect(PayController.state.analyticsSet).toBe(true)
      expect(subscribeKeySpy).toHaveBeenCalledWith('isPaymentInProgress', expect.any(Function))
    })

    it('should not reinitialize if already set', () => {
      PayController.state.analyticsSet = true
      const subscribeKeySpy = vi.spyOn(PayController, 'subscribeKey')

      PayController.initializeAnalytics()

      // Should return early without subscribing again
      expect(subscribeKeySpy).not.toHaveBeenCalled()
    })
  })

  describe('resetState', () => {
    it('should reset payment state', () => {
      PayController.state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      PayController.state.isPaymentInProgress = true
      PayController.state.currentPayment = { type: 'wallet', status: 'SUCCESS' }

      PayController.resetState()

      expect(PayController.state.error).toBeNull()
      expect(PayController.state.isPaymentInProgress).toBe(false)
      expect(PayController.state.currentPayment).toBeUndefined()
    })
  })

  describe('resetQuoteState', () => {
    it('should reset quote-related state', () => {
      PayController.state.quote = {} as any
      PayController.state.quoteStatus = 'success'
      PayController.state.quoteError = 'Some error'
      PayController.state.isFetchingQuote = true

      PayController.resetQuoteState()

      expect(PayController.state.quote).toBeUndefined()
      expect(PayController.state.quoteStatus).toBe('waiting')
      expect(PayController.state.quoteError).toBeNull()
      expect(PayController.state.isFetchingQuote).toBe(false)
    })
  })

  describe('setSelectedPaymentAsset', () => {
    it('should set selected payment asset', () => {
      const asset = { ...mockPaymentOptions.paymentAsset, amount: '100' }

      PayController.setSelectedPaymentAsset(asset)

      expect(PayController.state.selectedPaymentAsset).toEqual(asset)
    })
  })

  describe('setSelectedExchange', () => {
    it('should set selected exchange', () => {
      PayController.setSelectedExchange(mockExchanges[0])

      expect(PayController.state.selectedExchange).toEqual(mockExchanges[0])
    })
  })

  describe('setRequestId', () => {
    it('should set request ID', () => {
      PayController.setRequestId('new-request-id')

      expect(PayController.state.requestId).toBe('new-request-id')
    })
  })

  describe('setPaymentInProgress', () => {
    it('should set payment in progress', () => {
      PayController.setPaymentInProgress(true)

      expect(PayController.state.isPaymentInProgress).toBe(true)
    })
  })

  describe('getExchangeById', () => {
    it('should find exchange by ID', () => {
      PayController.state.exchanges = mockExchanges

      const result = PayController.getExchangeById('coinbase')

      expect(result).toEqual(mockExchanges[0])
    })

    it('should return undefined if exchange not found', () => {
      PayController.state.exchanges = mockExchanges

      const result = PayController.getExchangeById('non-existent')

      expect(result).toBeUndefined()
    })
  })
})
