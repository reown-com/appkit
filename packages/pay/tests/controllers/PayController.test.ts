import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type Address, type CaipNetworkId, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
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
      asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
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
      success: 'https://example.com',
      failure: 'https://example.com'
    },
    payWithExchange: 'coinbase'
  } as PaymentOptions

  const mockExchanges = [
    {
      id: 'coinbase',
      name: 'Coinbase',
      imageUrl: 'https://example.com/icon.png'
    },
    {
      id: 'binance',
      name: 'Binance',
      imageUrl: 'https://example.com/icon.png'
    }
  ] as Exchange[]

  const mockExchangesResponse = {
    exchanges: mockExchanges,
    total: 2
  }

  const mockPayUrlResponse = {
    url: 'https://exchange.com/buy?asset=eth&amount=10',
    sessionId: '123'
  }

  let eventsControllerSpy: ReturnType<typeof vi.spyOn>
  const mockPaymentId = 'mock-payment-id'

  beforeEach(() => {
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

    // Mock API calls
    vi.spyOn(ApiUtil, 'getExchanges').mockResolvedValue(mockExchangesResponse as any)
    vi.spyOn(ApiUtil, 'getPayUrl').mockResolvedValue(mockPayUrlResponse)

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
      const subscribeEventsSpy = vi.spyOn(PayController, 'subscribeEvents')
      const initializeAnalyticsSpy = vi.spyOn(PayController, 'initializeAnalytics')

      await PayController.handleOpenPay(mockPaymentOptions)

      expect(setPaymentConfigSpy).toHaveBeenCalledWith(mockPaymentOptions)
      expect(subscribeEventsSpy).toHaveBeenCalled()
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
        page: 0,
        asset: 'eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: '10'
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

  describe('handlePayment', () => {
    it('should handle EVM native token payment', async () => {
      // Setup for native asset payment
      PayController.state.paymentAsset = {
        ...mockPaymentOptions.paymentAsset,
        asset: 'native'
      }
      PayController.state.recipient = mockPaymentOptions.recipient
      PayController.state.amount = mockPaymentOptions.amount
      const expectedFromAddress = '0x1234567890123456789012345678901234567890'

      PayController.initializeAnalytics()
      PayController.state.currentPayment = { type: 'wallet', status: 'UNKNOWN' }

      await PayController.handlePayment()

      expect(PaymentUtil.processEvmNativePayment).toHaveBeenCalledWith(
        PayController.state.paymentAsset,
        ConstantsUtil.CHAIN.EVM,
        {
          recipient: mockPaymentOptions.recipient as Address,
          amount: mockPaymentOptions.amount,
          fromAddress: expectedFromAddress as Address
        }
      )
      expect(ModalController.open).toHaveBeenCalledWith({ view: 'PayLoading' })
      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_INITIATED',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: 'native',
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )

      PayController.state.currentPayment = { type: 'wallet', status: 'SUCCESS' }
      PayController.state.isPaymentInProgress = true
      PayController.state.isPaymentInProgress = false

      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_SUCCESS',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: 'native',
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )
    })

    it('should handle EVM ERC20 token payment', async () => {
      PayController.state.paymentAsset = {
        ...mockPaymentOptions.paymentAsset,
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      }
      PayController.state.recipient = mockPaymentOptions.recipient
      PayController.state.amount = mockPaymentOptions.amount
      const expectedFromAddress = '0x1234567890123456789012345678901234567890'

      PayController.initializeAnalytics()
      PayController.state.currentPayment = { type: 'wallet', status: 'UNKNOWN' }

      await PayController.handlePayment()

      expect(PaymentUtil.processEvmErc20Payment).toHaveBeenCalledWith(
        PayController.state.paymentAsset,
        {
          recipient: mockPaymentOptions.recipient as Address,
          amount: mockPaymentOptions.amount,
          fromAddress: expectedFromAddress as Address
        }
      )
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
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )
      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_SUCCESS',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: mockPaymentOptions.paymentAsset.asset,
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )
    })

    it('should handle payment processing errors', async () => {
      vi.spyOn(PaymentUtil, 'processEvmErc20Payment').mockRejectedValueOnce(
        new Error('Payment error')
      )
      PayController.initializeAnalytics()
      PayController.state.currentPayment = { type: 'wallet', status: 'UNKNOWN' }

      await PayController.handlePayment()

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
      expect(SnackController.showError).toHaveBeenCalled()
      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_INITIATED',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: mockPaymentOptions.paymentAsset.asset, // This assumes ERC20 context for error
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )
      expect(eventsControllerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          event: 'PAY_ERROR',
          properties: expect.objectContaining({
            paymentId: mockPaymentId,
            configuration: expect.objectContaining({
              amount: mockPaymentOptions.amount,
              asset: mockPaymentOptions.paymentAsset.asset, // This assumes ERC20 context for error
              network: mockPaymentOptions.paymentAsset.network,
              recipient: mockPaymentOptions.recipient
            }),
            currentPayment: expect.objectContaining({
              type: 'wallet',
              exchangeId: undefined,
              sessionId: undefined,
              result: undefined
            })
          })
        })
      )
    })

    it('should throw error for unsupported chain namespace', async () => {
      // Change to an unsupported chain
      Object.defineProperty(ChainController.state, 'activeChain', {
        get: vi.fn(() => 'unsupported'),
        configurable: true
      })

      await PayController.handlePayment()

      expect(PayController.state.error).toBe(AppKitPayErrorMessages.INVALID_CHAIN_NAMESPACE)
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

  describe('handlePayWithWallet', () => {
    it('should redirect to Connect if no caipAddress', () => {
      Object.defineProperty(ChainController.state, 'activeCaipAddress', {
        get: vi.fn(() => null),
        configurable: true
      })

      PayController.handlePayWithWallet()

      expect(RouterController.push).toHaveBeenCalledWith('Connect')
    })

    it('should redirect to Connect if parseCaipAddress returns incomplete data', () => {
      vi.spyOn(ParseUtil, 'parseCaipAddress').mockReturnValueOnce({
        chainId: null,
        address: null,
        chainNamespace: null
      } as any)

      PayController.handlePayWithWallet()

      expect(RouterController.push).toHaveBeenCalledWith('Connect')
    })

    it('should call handlePayment if user is connected', () => {
      const handlePaymentSpy = vi
        .spyOn(PayController, 'handlePayment')
        .mockImplementation(async () => {})

      PayController.handlePayWithWallet()

      expect(handlePaymentSpy).toHaveBeenCalled()
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

  describe('subscribeEvents', () => {
    it('should not subscribe if already configured', () => {
      PayController.state.isConfigured = true
      const subscribeSpy = vi.spyOn(ProviderController, 'subscribeProviders')

      PayController.subscribeEvents()

      expect(subscribeSpy).not.toHaveBeenCalled()
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
})
