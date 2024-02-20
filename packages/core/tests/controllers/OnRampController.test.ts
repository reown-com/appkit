import { describe, expect, it, vi } from 'vitest'
import {
  ApiController,
  BlockchainApiController,
  OnRampController,
  type OnRampProvider,
  type PaymentCurrency,
  type PurchaseCurrency
} from '../../index.js'
import { ONRAMP_PROVIDERS } from '../../src/utils/ConstantsUtil.js'
import {
  USDC_CURRENCY_DEFAULT,
  USD_CURRENCY_DEFAULT
} from '../../src/controllers/OnRampController.js'

// -- Tests --------------------------------------------------------------------
describe('OnRampController', () => {
  it('should have valid default state', () => {
    expect(OnRampController.state).toEqual({
      providers: ONRAMP_PROVIDERS as OnRampProvider[],
      selectedProvider: null,
      error: null,
      purchaseCurrency: USDC_CURRENCY_DEFAULT,
      paymentCurrency: USD_CURRENCY_DEFAULT,
      purchaseCurrencies: [USDC_CURRENCY_DEFAULT],
      paymentCurrencies: [],
      quotesLoading: false
    })
  })

  it('should get available currencies and properly update state', async () => {
    const purchaseCurrencies: PurchaseCurrency[] = [
      { id: 'test-coin', symbol: 'TEST', name: 'Test Coin', networks: [] },
      { id: 'test-coin-2', symbol: 'TES2', name: 'Test Coin 2', networks: [] }
    ]
    const paymentCurrencies: PaymentCurrency[] = [
      { id: 'test-currency', payment_method_limits: [] },
      { id: 'test-currency-2', payment_method_limits: [] }
    ]

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
})
