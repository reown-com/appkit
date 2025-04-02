import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainId, type ChainNamespace, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  ConnectionController,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKitPayErrorCodes } from '../types/errors.js'
import { AppKitPayError } from '../types/errors.js'
import type { Exchange } from '../types/exchange.js'
import type { PaymentOptions } from '../types/options.js'
import { getExchanges } from '../utils/ApiUtil.js'

const DEFAULT_PAGE = 0

// -- Types --------------------------------------------- //

export interface PayControllerState extends Pick<PaymentOptions, 'paymentAsset'> {
  activeAddress: string
  activeNetwork: string
  activeChainId: ChainId
  isConfigured: boolean
  error: string | null
  isPaymentInProgress: boolean
  isLoading: boolean
  exchanges: Exchange[]
}

type StateKey = keyof PayControllerState

// -- State --------------------------------------------- //
const state = proxy<PayControllerState>({
  activeAddress: '',
  activeNetwork: '',
  activeChainId: 0,
  paymentAsset: {
    network: 'eip155:1',
    recipient: '0x0',
    asset: '0x0',
    amount: 0n,
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
  isLoading: false
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
    this.populateState()
    this.setPaymentConfig(options)
    this.subscribeEvents()
    state.isConfigured = true
    await ModalController.open({
      view: 'Pay'
    })
  },

  populateState() {
    const activeChain = ChainController.state.activeChain as ChainNamespace
    if (!activeChain) {
      return
    }
    state.activeNetwork = activeChain
    const activeAddress = AccountController.state.caipAddress
    if (!activeAddress) {
      return
    }
    const { chainId, address } = ParseUtil.parseCaipAddress(activeAddress)

    state.activeAddress = address
    state.activeChainId = chainId
  },

  // -- Setters ----------------------------------------- //
  setPaymentConfig(config: PaymentOptions) {
    try {
      state.paymentAsset = config.paymentAsset

      state.error = null
    } catch (error) {
      state.error = (error as Error).message
    }
  },

  setActiveAddress(activeAddress: string) {
    state.activeAddress = activeAddress
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
    } finally {
      state.isLoading = false
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
      state.activeNetwork = chainNamespace

      await this.handlePayment()
    })

    AccountController.subscribeKey('caipAddress', async caipAddress => {
      if (!caipAddress) {
        return
      }

      const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)

      state.activeAddress = address
      state.activeChainId = chainId

      await this.handlePayment()
    })
  },
  async handlePayment() {
    if (!state.activeAddress || !state.activeChainId || !state.activeNetwork) {
      return
    }

    const provider = ProviderUtil.getProvider(state.activeNetwork as ChainNamespace)
    if (!provider) {
      return
    }

    try {
      if (state.activeNetwork === ConstantsUtil.CHAIN.EVM) {
        if (state.paymentAsset.asset === 'native') {
          state.isPaymentInProgress = true
          await ModalController.open({
            view: 'PayLoading'
          })
          const gasPrice = await provider.request({
            method: 'eth_gasPrice',
            params: []
          })
          const res = await ConnectionController.sendTransaction({
            chainNamespace: state.activeNetwork,
            to: state.paymentAsset.recipient as `0x${string}`,
            address: state.activeAddress as `0x${string}`,
            value: state.paymentAsset.amount,
            data: '0x',
            gasPrice: BigInt(gasPrice as string)
          })

          // eslint-disable-next-line no-console
          console.log('res', { res })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('error', { error })
      state.error = (error as Error).message
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
    if (!state.activeAddress || !state.activeChainId || !state.activeNetwork) {
      RouterController.push('Connect')
    }
    this.handlePayment()
  }
}
