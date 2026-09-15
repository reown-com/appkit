import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { OnRampProvider as OnRampProviderName } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'

import { MELD_PUBLIC_KEY, ONRAMP_PROVIDERS } from '../utils/ConstantsUtil.js'
import type { PaymentCurrency, PurchaseCurrency } from '../utils/TypeUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
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
  purchaseAmount?: number
  paymentAmount?: number
  providers: OnRampProvider[]
  error: string | null
  quotesLoading: boolean
  /**
   * ISO 3166-1 alpha-2 country code forwarded to Meld.
   * When unset, AppKit falls back to the browser locale region, then US for USD.
   */
  countryCode?: string
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
  quotesLoading: false
}

// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>(defaultState)


function getBrowserCountryCode(): string | undefined {
  if (!CoreHelperUtil.isClient()) {
    return undefined
  }

  try {
    const locale =
      Intl.DateTimeFormat().resolvedOptions().locale || window.navigator.language
    if (!locale) {
      return undefined
    }

    if (typeof Intl.Locale === 'function') {
      const region = new Intl.Locale(locale).region
      if (region) {
        return region.toUpperCase()
      }
    }

    const match = locale.match(/[-_]([A-Za-z]{2})$/)
    if (match?.[1]) {
      return match[1].toUpperCase()
    }
  } catch {
    // Ignore locale resolution failures and fall through to currency defaults.
  }

  return undefined
}

function resolveOnRampCountryCode(paymentCurrencyId?: string): string | undefined {
  if (state.countryCode) {
    return state.countryCode.toUpperCase()
  }

  const browserCountry = getBrowserCountryCode()
  if (browserCountry) {
    return browserCountry
  }

  // Default USD on-ramp traffic without a locale region still needs a country so
  // Meld does not route to Binance Connect with a fabricated receive amount.
  if (paymentCurrencyId === 'USD') {
    return 'US'
  }

  return undefined
}

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

      const countryCode = resolveOnRampCountryCode(state.paymentCurrency?.id)
      if (countryCode) {
        url.searchParams.append('countryCode', countryCode)
      }

      const sourceCurrencyCode = state.paymentCurrency?.id
      if (sourceCurrencyCode) {
        url.searchParams.append('sourceCurrencyCode', sourceCurrencyCode)
      }

      if (typeof state.paymentAmount === 'number') {
        url.searchParams.append('sourceAmount', String(state.paymentAmount))
      }

      state.selectedProvider = { ...provider, url: url.toString() }
    } else {
      state.selectedProvider = provider
    }
  },

  setCountryCode(countryCode: string | undefined) {
    state.countryCode = countryCode
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

  setPurchaseAmount(amount: number) {
    OnRampController.state.purchaseAmount = amount
  },

  setPaymentAmount(amount: number) {
    OnRampController.state.paymentAmount = amount
  },

  async getAvailableCurrencies() {
    const options = await BlockchainApiController.getOnrampOptions()
    state.purchaseCurrencies = options.purchaseCurrencies
    state.paymentCurrencies = options.paymentCurrencies
    state.paymentCurrency = options.paymentCurrencies[0] || USD_CURRENCY_DEFAULT
    state.purchaseCurrency = options.purchaseCurrencies[0] || USDC_CURRENCY_DEFAULT
    await ApiController.fetchCurrencyImages(options.paymentCurrencies.map(currency => currency.id))
    await ApiController.fetchTokenImages(
      options.purchaseCurrencies.map(currency => currency.symbol)
    )
  },

  async getQuote() {
    state.quotesLoading = true
    try {
      const quote = await BlockchainApiController.getOnrampQuote({
        purchaseCurrency: state.purchaseCurrency,
        paymentCurrency: state.paymentCurrency,
        amount: state.paymentAmount?.toString() || '0',
        network: state.purchaseCurrency?.symbol
      })
      state.quotesLoading = false
      state.purchaseAmount = Number(quote?.purchaseAmount.amount)

      return quote
    } catch (error) {
      state.error = (error as Error).message
      state.quotesLoading = false

      return null
    } finally {
      state.quotesLoading = false
    }
  },

  resetState() {
    state.selectedProvider = null
    state.error = null
    state.purchaseCurrency = USDC_CURRENCY_DEFAULT
    state.paymentCurrency = USD_CURRENCY_DEFAULT
    state.purchaseCurrencies = [USDC_CURRENCY_DEFAULT]
    state.paymentCurrencies = []
    state.paymentAmount = undefined
    state.purchaseAmount = undefined
    state.quotesLoading = false
    state.countryCode = undefined
  }
}

// Export the controller wrapped with our error boundary
export const OnRampController = withErrorBoundary(controller)
