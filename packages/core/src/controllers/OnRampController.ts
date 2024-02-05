import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { ONRAMP_PROVIDERS } from '../utils/ConstantsUtil.js'
import type { PurchaseCurrency, PaymentCurrency } from '../utils/TypeUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'

// -- Types --------------------------------------------- //
export type OnRampProviderOption = 'coinbase' | 'moonpay' | 'stripe' | 'paypal'

export type OnRampProvider = {
  label: string
  name: OnRampProviderOption
  feeRange: string
  url: string
}

export interface OnRampControllerState {
  selectedProvider: OnRampProvider | null
  purchaseCurrency: PurchaseCurrency | null
  paymentCurrency: PaymentCurrency | null
  purchaseCurrencies: PurchaseCurrency[]
  paymentCurrencies: PaymentCurrency[]
  providers: OnRampProvider[]
  error: string | null
}

type StateKey = keyof OnRampControllerState

// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>({
  providers: ONRAMP_PROVIDERS as OnRampProvider[],
  selectedProvider: null,
  error: null,
  purchaseCurrency: null,
  paymentCurrency: null,
  purchaseCurrencies: [],
  paymentCurrencies: []
})

// -- Controller ---------------------------------------- //
export const OnRampController = {
  state,

  subscribe(callback: (newState: OnRampControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: OnRampControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setSelectedProvider(provider: OnRampProvider | null) {
    state.selectedProvider = provider
  },

  setPurchaseCurrency(currency: PurchaseCurrency | null) {
    state.purchaseCurrency = currency
  },

  setPaymentCurrency(currency: PaymentCurrency | null) {
    state.paymentCurrency = currency
  },

  async getAvailableCurrencies() {
    const options = await BlockchainApiController.getOnrampOptions()
    state.purchaseCurrencies = options.purchaseCurrencies
    state.paymentCurrencies = options.paymentCurrencies
    state.paymentCurrency = options.paymentCurrencies[0] || null
    state.purchaseCurrency = options.purchaseCurrencies[0] || null
  }
}
