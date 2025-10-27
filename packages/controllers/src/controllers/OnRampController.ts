import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { OnRampProvider as OnRampProviderName } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'

import { MELD_PUBLIC_KEY, ONRAMP_PROVIDERS } from '../utils/ConstantsUtil.js'
import type {
  OnRampCryptoCurrency,
  OnRampFiatCurrency,
  OnRampQuote,
  PaymentCurrency,
  PurchaseCurrency
} from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ApiController } from './ApiController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'

// -- Types --------------------------------------------- //
export type OnRampProviderOption = 'meld'

export type OnRampProvider = {
  label: string
  name: OnRampProviderOption
  feeRange: string
  url: string
  supportedChains: string[]
}

export interface OnRampControllerState {
  selectedProvider: OnRampProvider | null
  purchaseCurrency: PurchaseCurrency
  paymentCurrency: PaymentCurrency
  purchaseCurrencies: PurchaseCurrency[]
  paymentCurrencies: PaymentCurrency[]
  cryptoAmount?: string
  fiatAmount?: string
  providers: OnRampProvider[]
  error: string | null
  cryptoCurrencies: OnRampCryptoCurrency[]
  cryptoCurrenciesLoading: boolean
  fiatCurrencies: OnRampFiatCurrency[]
  fiatCurrenciesLoading: boolean
  selectedCryptoCurrency: OnRampCryptoCurrency | null
  selectedFiatCurrency: OnRampFiatCurrency | null
  quote: OnRampQuote | null
  quoteLoading: boolean
}

type StateKey = keyof OnRampControllerState

export const USDC_CURRENCY_DEFAULT = {
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

export const USD_CURRENCY_DEFAULT = {
  id: 'USD',
  payment_method_limits: [
    {
      id: 'card',
      min: '10.00',
      max: '7500.00'
    },
    {
      id: 'ach_bank_account',
      min: '10.00',
      max: '25000.00'
    }
  ]
}

const defaultState = {
  providers: ONRAMP_PROVIDERS as OnRampProvider[],
  selectedProvider: null,
  error: null,
  purchaseCurrency: USDC_CURRENCY_DEFAULT,
  paymentCurrency: USD_CURRENCY_DEFAULT,
  purchaseCurrencies: [USDC_CURRENCY_DEFAULT],
  paymentCurrencies: [],
  cryptoCurrencies: [],
  cryptoCurrenciesLoading: false,
  fiatCurrencies: [],
  fiatCurrenciesLoading: false,
  selectedCryptoCurrency: null,
  selectedFiatCurrency: null,
  quote: null,
  quoteLoading: false
}

// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>(defaultState)

const DEFAULT_PAYMENT_METHOD = 'credit_debit_card'
const DEFAULT_NETWORK = 'ethereum'

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (newState: OnRampControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: OnRampControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setSelectedProvider(provider: OnRampProvider | null) {
    if (provider && provider.name === 'meld') {
      const activeChain = ChainController.state.activeChain
      const currency = activeChain === ConstantsUtil.CHAIN.SOLANA ? 'SOL' : 'USDC'
      const address = activeChain
        ? (ChainController.state.chains.get(activeChain)?.accountState?.address ?? '')
        : ''
      const url = new URL(provider.url)
      url.searchParams.append('publicKey', MELD_PUBLIC_KEY)
      url.searchParams.append('destinationCurrencyCode', currency)
      url.searchParams.append('walletAddress', address)
      url.searchParams.append('externalCustomerId', OptionsController.state.projectId)
      state.selectedProvider = { ...provider, url: url.toString() }
    } else {
      state.selectedProvider = provider
    }
  },

  setOnrampProviders(providers: OnRampProviderName[]) {
    if (Array.isArray(providers) && providers.every(item => typeof item === 'string')) {
      const validOnramp = providers as string[]

      const newProviders = ONRAMP_PROVIDERS.filter(provider => validOnramp.includes(provider.name))

      state.providers = newProviders as OnRampProvider[]
    } else {
      state.providers = []
    }
  },

  setPurchaseCurrency(currency: PurchaseCurrency) {
    state.purchaseCurrency = currency
  },

  setPaymentCurrency(currency: PaymentCurrency) {
    state.paymentCurrency = currency
  },

  setCryptoAmount(amount: string) {
    OnRampController.state.cryptoAmount = amount
  },

  setFiatAmount(amount: string) {
    OnRampController.state.fiatAmount = amount
  },

  async getAvailableCurrencies() {
    const options = await BlockchainApiController.getOnRampOptions()
    state.purchaseCurrencies = options.purchaseCurrencies
    state.paymentCurrencies = options.paymentCurrencies
    state.paymentCurrency = options.paymentCurrencies[0] || USD_CURRENCY_DEFAULT
    state.purchaseCurrency = options.purchaseCurrencies[0] || USDC_CURRENCY_DEFAULT
    await ApiController.fetchCurrencyImages(options.paymentCurrencies.map(currency => currency.id))
    await ApiController.fetchTokenImages(
      options.purchaseCurrencies.map(currency => currency.symbol)
    )
  },

  async getCryptoCurrencies() {
    try {
      state.cryptoCurrenciesLoading = true
      const currencies = await BlockchainApiController.getOnRampCryptoCurrencies()
      state.cryptoCurrencies = currencies
    } finally {
      state.cryptoCurrenciesLoading = false
    }
  },

  async getFiatCurrencies() {
    try {
      state.fiatCurrenciesLoading = true
      const currencies = await BlockchainApiController.getOnRampFiatCurrencies()
      state.fiatCurrencies = currencies
    } finally {
      state.fiatCurrenciesLoading = false
    }
  },

  setSelectedCryptoCurrency(currency: OnRampCryptoCurrency) {
    state.selectedCryptoCurrency = currency
  },

  setSelectedFiatCurrency(currency: OnRampFiatCurrency) {
    state.selectedFiatCurrency = currency
  },

  async getQuote() {
    try {
      state.quote = null
      state.quoteLoading = true

      if (!state.selectedFiatCurrency) {
        throw new Error('Fiat currency is not selected')
      }

      if (!state.selectedCryptoCurrency) {
        throw new Error('Crypto currency is not selected')
      }

      if (!state.fiatAmount) {
        throw new Error('Payment amount is not set')
      }

      const quote = await BlockchainApiController.getOnRampQuote({
        fiatCurrency: state.selectedFiatCurrency,
        cryptoCurrency: state.selectedCryptoCurrency,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        fiatAmount: state.fiatAmount,
        network: DEFAULT_NETWORK
      })

      console.log('quote', quote)

      state.quote = ref({ ...quote }) as OnRampQuote

      return quote
    } finally {
      state.quoteLoading = false
    }
  },

  resetState() {
    state.selectedProvider = null
    state.error = null
    state.purchaseCurrency = USDC_CURRENCY_DEFAULT
    state.paymentCurrency = USD_CURRENCY_DEFAULT
    state.purchaseCurrencies = [USDC_CURRENCY_DEFAULT]
    state.paymentCurrencies = []
    state.cryptoCurrencies = []
    state.fiatCurrencies = []
    state.fiatAmount = undefined
    state.cryptoAmount = undefined
    state.quote = null
    state.quoteLoading = false
    state.selectedCryptoCurrency = null
    state.selectedFiatCurrency = null
    state.cryptoCurrenciesLoading = false
    state.fiatCurrenciesLoading = false
  }
}

// Export the controller wrapped with our error boundary
export const OnRampController = withErrorBoundary(controller)
