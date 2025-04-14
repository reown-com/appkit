import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import {
  AppKitPayErrorCodes,
  type AppKitPayErrorMessage,
  AppKitPayErrorMessages
} from '../types/errors.js'
import { AppKitPayError } from '../types/errors.js'
import type { Exchange } from '../types/exchange.js'
import type { PaymentOptions } from '../types/options.js'
import { getExchanges, getPayUrl } from '../utils/ApiUtil.js'
import { formatCaip19Asset } from '../utils/AssetUtil.js'
import {
  ensureCorrectNetwork,
  processEvmErc20Payment,
  processEvmNativePayment
} from '../utils/PaymentUtil.js'

const DEFAULT_PAGE = 0

// -- Types --------------------------------------------- //

export interface PayControllerState extends PaymentOptions {
  isConfigured: boolean
  error: AppKitPayErrorMessage | null
  isPaymentInProgress: boolean
  isLoading: boolean
  exchanges: Exchange[]
  payResult?: PayResult
  paymentType: PaymentType
}

type StateKey = keyof PayControllerState
type PaymentType = 'wallet' | 'exchange'

type WalletPayResult = {
  type: 'wallet'
  result?: string
}
type ExchangePayResult = {
  type: 'exchange'
  exchangeId: string
}
export type PayResult = WalletPayResult | ExchangePayResult
// -- State --------------------------------------------- //
const state = proxy<PayControllerState>({
  paymentAsset: {
    network: 'eip155:1',
    recipient: '0x0',
    asset: '0x0',
    amount: 0,
    metadata: {
      name: '0x0',
      symbol: '0x0',
      decimals: 0
    }
  },
  isConfigured: false,
  error: null,
  isPaymentInProgress: false,
  exchanges: [],
  isLoading: false,
  openInNewTab: true,
  redirectUrl: undefined,
  payWithExchange: undefined,
  payResult: undefined,
  paymentType: 'wallet'
})

// -- Controller ---------------------------------------- //
export const PayController = {
  state,

  // -- Subscriptions ----------------------------------- //
  subscribe(callback: (newState: PayControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: PayControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async handleOpenPay(options: PaymentOptions) {
    this.resetState()
    this.setPaymentConfig(options)
    this.subscribeEvents()
    state.isConfigured = true
    await ModalController.open({
      view: 'Pay'
    })
  },

  resetState() {
    state.paymentAsset = {
      network: 'eip155:1',
      recipient: '0x0',
      asset: '0x0',
      amount: 0,
      metadata: { name: '0x0', symbol: '0x0', decimals: 0 }
    }
    state.isConfigured = false
    state.error = null
    state.isPaymentInProgress = false
    state.isLoading = false
    state.payResult = undefined
    state.paymentType = 'wallet'
  },

  // -- Setters ----------------------------------------- //
  setPaymentConfig(config: PaymentOptions) {
    if (!config.paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    try {
      state.paymentAsset = config.paymentAsset
      state.openInNewTab = config.openInNewTab ?? true
      state.redirectUrl = config.redirectUrl
      state.payWithExchange = config.payWithExchange
      state.error = null
    } catch (error) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG, (error as Error).message)
    }
  },

  // -- Getters ----------------------------------------- //
  getPaymentAsset() {
    return state.paymentAsset
  },

  getExchanges() {
    return state.exchanges
  },

  async fetchExchanges() {
    try {
      state.isLoading = true
      const response = await getExchanges({
        page: DEFAULT_PAGE
      })
      // Putting this here in order to maintain backawrds compatibility with the UI when we introduce more exchanges
      state.exchanges = response.exchanges.slice(0, 2)
    } catch (error) {
      SnackController.showError(AppKitPayErrorMessages.UNABLE_TO_GET_EXCHANGES)
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)
    } finally {
      state.isLoading = false
    }
  },

  async getPayUrl(exchangeId: string) {
    try {
      const amount = Number(state.paymentAsset.amount)
      const response = await getPayUrl({
        exchangeId,
        asset: formatCaip19Asset(state.paymentAsset.network, state.paymentAsset.asset),
        amount: amount.toString(16),
        recipient: `${state.paymentAsset.network}:${state.paymentAsset.recipient}`
      })

      return response.url
    } catch (error) {
      if (error instanceof Error && error.message.includes('is not supported')) {
        throw new AppKitPayError(AppKitPayErrorCodes.ASSET_NOT_SUPPORTED)
      }
      throw new Error((error as Error).message)
    }
  },

  subscribeEvents() {
    if (state.isConfigured) {
      return
    }
    ProviderUtil.subscribeProviders(async _ => {
      const chainNamespace = ChainController.state.activeChain as ChainNamespace
      const provider = ProviderUtil.getProvider(chainNamespace)
      if (!provider) {
        return
      }
      await this.handlePayment()
    })

    AccountController.subscribeKey('caipAddress', async caipAddress => {
      if (!caipAddress) {
        return
      }
      await this.handlePayment()
    })
  },
  async handlePayment() {
    state.paymentType = 'wallet'
    const caipAddress = AccountController.state.caipAddress
    if (!caipAddress) {
      return
    }
    const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
    const chainNamespace = ChainController.state.activeChain as ChainNamespace
    if (!address || !chainId || !chainNamespace) {
      return
    }

    const provider = ProviderUtil.getProvider(chainNamespace)
    if (!provider) {
      return
    }

    const caipNetwork = ChainController.state.activeCaipNetwork
    if (!caipNetwork) {
      return
    }
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()

    await ensureCorrectNetwork({
      paymentAssetNetwork: state.paymentAsset.network,
      activeCaipNetwork: caipNetwork,
      approvedCaipNetworkIds,
      requestedCaipNetworks
    })

    try {
      state.payResult = undefined
      state.isPaymentInProgress = true
      await ModalController.open({
        view: 'PayLoading'
      })

      switch (chainNamespace) {
        case ConstantsUtil.CHAIN.EVM:
          if (state.paymentAsset.asset === 'native') {
            state.payResult = {
              type: 'wallet',
              result: await processEvmNativePayment(
                state.paymentAsset,
                chainNamespace,
                address as `0x${string}`
              )
            }
          }
          if (state.paymentAsset.asset.startsWith('0x')) {
            state.payResult = {
              type: 'wallet',
              result: await processEvmErc20Payment(state.paymentAsset, address as `0x${string}`)
            }
          }
          break
        case ConstantsUtil.CHAIN.SOLANA:
          break
        default:
          throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
      }
    } catch (error) {
      if (error instanceof AppKitPayError) {
        state.error = error.message
      } else {
        state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      }
      SnackController.showError(state.error)
    } finally {
      state.isPaymentInProgress = false
    }
  },

  getExchangeById(exchangeId: string) {
    return state.exchanges.find(exchange => exchange.id === exchangeId)
  },

  validatePayConfig(config: PaymentOptions) {
    const { paymentAsset } = config

    if (!paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    if (!paymentAsset.recipient) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_RECIPIENT)
    }

    if (!paymentAsset.asset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_ASSET)
    }

    if (!paymentAsset.amount) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_AMOUNT)
    }
  },

  handlePayWithWallet() {
    const caipAddress = AccountController.state.caipAddress
    if (!caipAddress) {
      RouterController.push('Connect')

      return
    }
    const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
    const chainNamespace = ChainController.state.activeChain as ChainNamespace
    if (!address || !chainId || !chainNamespace) {
      RouterController.push('Connect')

      return
    }
    this.handlePayment()
  },

  async handlePayWithExchange(exchangeId: string) {
    try {
      state.paymentType = 'exchange'
      state.isPaymentInProgress = false
      const payUrl = await this.getPayUrl(exchangeId)
      if (!payUrl) {
        throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT)
      }
      RouterController.push('PayLoading')

      if (state.openInNewTab) {
        CoreHelperUtil.openHref(payUrl, '_blank')
        state.payResult = {
          type: 'exchange',
          exchangeId
        }
        await ModalController.open({
          view: 'PayLoading'
        })

        return
      }
      CoreHelperUtil.openHref(payUrl, '_self')
    } catch (error) {
      if (error instanceof AppKitPayError) {
        state.error = error.message
      } else {
        state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      }
      SnackController.showError(state.error)
    }
  }
}
