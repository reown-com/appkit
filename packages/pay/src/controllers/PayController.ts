import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKitPayErrorCodes, AppKitPayErrorMessages } from '../types/errors.js'
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
  error: string | null
  isPaymentInProgress: boolean
  isLoading: boolean
  exchanges: Exchange[]
  payResult?: string
}

type StateKey = keyof PayControllerState

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
  payResult: undefined
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
    this.setPaymentConfig(options)
    this.subscribeEvents()
    state.isConfigured = true
    await ModalController.open({
      view: 'Pay'
    })
  },

  // -- Setters ----------------------------------------- //
  setPaymentConfig(config: PaymentOptions) {
    if (!config.paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    try {
      state.paymentAsset = config.paymentAsset
      state.openInNewTab = config.openInNewTab
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
      SnackController.showError((error as Error).message)
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
            state.payResult = await processEvmNativePayment(
              state.paymentAsset,
              chainNamespace,
              address as `0x${string}`
            )
          }
          if (state.paymentAsset.asset.startsWith('0x')) {
            state.payResult = await processEvmErc20Payment(
              state.paymentAsset,
              address as `0x${string}`
            )
          }
          break
        case ConstantsUtil.CHAIN.SOLANA:
          break
        default:
          throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
      }
    } catch (error) {
      state.error = (error as Error).message
      // eslint-disable-next-line no-console
      console.log(state.error)
      SnackController.showError(AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR)
    } finally {
      state.isPaymentInProgress = false
    }
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
    const payUrl = await this.getPayUrl(exchangeId)
    if (!payUrl) {
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT)
    }

    RouterController.push('PayLoading')
    const target = state.openInNewTab ? '_blank' : '_self'
    window.open(payUrl, target)
  }
}
