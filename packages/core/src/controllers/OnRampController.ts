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
  purchaseCurrency?: PurchaseCurrency
  paymentCurrency?: PaymentCurrency
  purchaseCurrencies: PurchaseCurrency[]
  paymentCurrencies: PaymentCurrency[]
  purchaseAmount?: number
  paymentAmount?: number
  providers: OnRampProvider[]
  error: string | null
}

type StateKey = keyof OnRampControllerState

const USDC_CURRENCY_DEFAULT = {
  id: '2b92315d-eab7-5bef-84fa-089a131333f5',
  name: 'USD Coin',
  symbol: 'USDC',
  networks: [
    {
      name: 'ethereum-mainnet',
      display_name: 'Ethereum',
      chain_id: '1',
      contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    {
      name: 'polygon-mainnet',
      display_name: 'Polygon',
      chain_id: '137',
      contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    }
  ]
}
// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>({
  providers: ONRAMP_PROVIDERS as OnRampProvider[],
  selectedProvider: null,
  error: null,
  purchaseCurrency: USDC_CURRENCY_DEFAULT,
  purchaseCurrencies: [USDC_CURRENCY_DEFAULT],
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

  setPurchaseCurrency(currency: PurchaseCurrency) {
    state.purchaseCurrency = currency
  },

  setPaymentCurrency(currency: PaymentCurrency) {
    state.paymentCurrency = currency
  },

  setPurchaseAmount(amount: number) {
    this.state.purchaseAmount = amount
  },

  setPaymentAmount(amount: number) {
    this.state.paymentAmount = amount
  },

  async getAvailableCurrencies() {
    const options = await BlockchainApiController.getOnrampOptions()
    state.purchaseCurrencies = options.purchaseCurrencies
    state.paymentCurrencies = options.paymentCurrencies
    state.paymentCurrency = options.paymentCurrencies[0]
    state.purchaseCurrency = options.purchaseCurrencies[0]
  }
}
