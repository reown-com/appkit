import { describe, expect, it, vi } from 'vitest'

import {
  AccountController,
  ApiController,
  BlockchainApiController,
  OnRampController,
  type OnRampProvider,
  OptionsController,
  type PaymentCurrency,
  type PurchaseCurrency
} from '../../exports/index.js'
import {
  USDC_CURRENCY_DEFAULT,
  USD_CURRENCY_DEFAULT
} from '../../src/controllers/OnRampController.js'
import { MELD_PUBLIC_KEY, ONRAMP_PROVIDERS } from '../../src/utils/ConstantsUtil.js'

const purchaseCurrencies: [PurchaseCurrency, ...PurchaseCurrency[]] = [
  { id: 'test-coin', symbol: 'TEST', name: 'Test Coin', networks: [] },
  { id: 'test-coin-2', symbol: 'TES2', name: 'Test Coin 2', networks: [] }
]
const paymentCurrencies: [PaymentCurrency, ...PaymentCurrency[]] = [
  { id: 'test-currency', payment_method_limits: [] },
  { id: 'test-currency-2', payment_method_limits: [] }
]

const mockQuote = {
  paymentTotal: {
    amount: '100',
    currency: 'USD'
  },
  paymentSubtotal: {
    amount: '200',
    currency: 'USD'
  },
  purchaseAmount: {
    amount: '100',
    currency: 'USDC'
  },
  coinbaseFee: {
    amount: '50',
    currency: 'USD'
  },
  networkFee: {
    amount: '50',
    currency: 'USD'
  },
  quoteId: 'test'
}

const defaultState = {
  providers: ONRAMP_PROVIDERS as OnRampProvider[],
  selectedProvider: null,
  error: null,
  purchaseCurrency: USDC_CURRENCY_DEFAULT,
  paymentCurrency: USD_CURRENCY_DEFAULT,
  purchaseCurrencies: [USDC_CURRENCY_DEFAULT],
  paymentCurrencies: [],
  quotesLoading: false
}

// -- Tests --------------------------------------------------------------------
describe('OnRampController', () => {
  it('should have valid default state', () => {
    expect(OnRampController.state).toEqual(defaultState)
  })

  it('should get available currencies and properly update state', async () => {
    OnRampController.resetState()
    const getOnrampOptions = vi
      .spyOn(BlockchainApiController, 'getOnrampOptions')
      .mockResolvedValueOnce({
        purchaseCurrencies,
        paymentCurrencies
      })

    const fetchCurrencyImages = vi
      .spyOn(ApiController, 'fetchCurrencyImages')
      .mockResolvedValueOnce(undefined)

    const fetchTokenImages = vi
      .spyOn(ApiController, 'fetchTokenImages')
      .mockResolvedValueOnce(undefined)

    await OnRampController.getAvailableCurrencies()
    expect(getOnrampOptions).toHaveBeenCalled()
    expect(fetchCurrencyImages).toHaveBeenCalledWith(
      paymentCurrencies?.map(currency => currency.id)
    )
    expect(fetchTokenImages).toHaveBeenCalledWith(purchaseCurrencies?.map(token => token.symbol))
    expect(OnRampController.state.purchaseCurrencies).toEqual(purchaseCurrencies)
    expect(OnRampController.state.paymentCurrencies).toEqual(paymentCurrencies)
  })

  it('should get quotes and properly update state with default params', async () => {
    OnRampController.resetState()
    const getOnrampQuote = vi
      .spyOn(BlockchainApiController, 'getOnrampQuote')
      .mockResolvedValue(mockQuote)

    const quote = await OnRampController.getQuote()
    expect(quote).toEqual(mockQuote)
    expect(getOnrampQuote).toHaveBeenCalledWith({
      purchaseCurrency: USDC_CURRENCY_DEFAULT,
      paymentCurrency: USD_CURRENCY_DEFAULT,
      amount: '0',
      network: 'USDC'
    })
  })

  it('should get quotes and properly update state with set state', async () => {
    OnRampController.resetState()

    const getOnrampQuote = vi
      .spyOn(BlockchainApiController, 'getOnrampQuote')
      .mockResolvedValue(mockQuote)

    OnRampController.setPaymentAmount(100)
    OnRampController.setPurchaseCurrency(purchaseCurrencies[0])
    OnRampController.setPaymentCurrency(paymentCurrencies[0])

    const quote = await OnRampController.getQuote()

    expect(quote).toEqual(mockQuote)
    expect(getOnrampQuote).toHaveBeenCalledWith({
      purchaseCurrency: purchaseCurrencies[0],
      paymentCurrency: paymentCurrencies[0],
      amount: '100',
      network: 'TEST'
    })

    expect(OnRampController.state.purchaseAmount).toEqual(100)
    expect(OnRampController.state.quotesLoading).toEqual(false)
  })

  it('should set error when failing to get quotes', async () => {
    OnRampController.resetState()
    const error = new Error('Test error')
    const getOnrampQuote = vi
      .spyOn(BlockchainApiController, 'getOnrampQuote')
      .mockRejectedValue(error)

    const quote = await OnRampController.getQuote()

    expect(quote).toEqual(null)
    expect(getOnrampQuote).toHaveBeenCalled()
    expect(OnRampController.state.error).toEqual(error.message)
    expect(OnRampController.state.quotesLoading).toEqual(false)
  })

  it('should set providers if valid names are provided', () => {
    const validProviderNames = ['coinbase', 'moonpay']
    const expectedProviders = ONRAMP_PROVIDERS.filter(p => validProviderNames.includes(p.name))
    OnRampController.setOnrampProviders(validProviderNames as any)
    expect(OnRampController.state.providers).toEqual(expectedProviders)
  })

  it('should filter out invalid provider names', () => {
    const mixedProviderNames = ['coinbase', 'invalidProvider', 'moonpay']
    const expectedProviders = ONRAMP_PROVIDERS.filter(p => ['coinbase', 'moonpay'].includes(p.name))
    OnRampController.setOnrampProviders(mixedProviderNames as any)
    expect(OnRampController.state.providers).toEqual(expectedProviders)
  })

  it('should set an empty array if no valid provider names are provided', () => {
    const invalidProviderNames = ['invalid1', 'invalid2']
    OnRampController.setOnrampProviders(invalidProviderNames as any)
    expect(OnRampController.state.providers).toEqual([])
  })

  it('should set an empty array if an empty array is provided', () => {
    OnRampController.setOnrampProviders([])
    expect(OnRampController.state.providers).toEqual([])
  })

  it('should set an empty array if the input is not an array of strings', () => {
    OnRampController.setOnrampProviders(null as any)
    expect(OnRampController.state.providers).toEqual([])

    OnRampController.resetState()

    OnRampController.setOnrampProviders({ provider: 'coinbase' } as any)
    expect(OnRampController.state.providers).toEqual([])

    OnRampController.resetState()

    OnRampController.setOnrampProviders(['coinbase', 123] as any)
    expect(OnRampController.state.providers).toEqual([])
  })

  it('should properly configure meld url', () => {
    AccountController.state.address = '0x123'
    OptionsController.state.projectId = 'test'
    OnRampController.resetState()
    const meldProvider = ONRAMP_PROVIDERS[0] as OnRampProvider
    OnRampController.setSelectedProvider(meldProvider)
    const resultUrl = new URL(meldProvider.url)
    resultUrl.searchParams.append('publicKey', MELD_PUBLIC_KEY)
    resultUrl.searchParams.append('destinationCurrencyCode', 'USDC')
    resultUrl.searchParams.append('walletAddress', '0x123')
    resultUrl.searchParams.append('externalCustomerId', 'test')

    expect(OnRampController.state.selectedProvider?.url).toEqual(resultUrl.toString())
  })
})
