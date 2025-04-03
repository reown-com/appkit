import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace, ConstantsUtil, ContractUtil, ParseUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKitPayErrorCodes } from '../types/errors.js'
import { AppKitPayError } from '../types/errors.js'
import type { Exchange } from '../types/exchange.js'
import type { PaymentOptions } from '../types/options.js'
import { getExchanges, getPayUrl } from '../utils/ApiUtil.js'
import { formatCaip19Asset } from '../utils/AssetUtil.js'

const DEFAULT_PAGE = 0

// -- Types --------------------------------------------- //

export interface PayControllerState extends Pick<PaymentOptions, 'paymentAsset'> {
  isConfigured: boolean
  error: string | null
  isPaymentInProgress: boolean
  isLoading: boolean
  exchanges: Exchange[]
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
    this.setPaymentConfig(options)
    this.subscribeEvents()
    state.isConfigured = true
    await ModalController.open({
      view: 'Pay'
    })
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

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    const assetCaipNetwork = sortedNetworks.find(
      network => network.caipNetworkId === state.paymentAsset.network
    )

    if (!assetCaipNetwork) {
      return
    }

    if (assetCaipNetwork.caipNetworkId !== caipNetwork.caipNetworkId) {
      try {
        const isSupportingAllNetworks = ChainController.getNetworkProp(
          'supportsAllNetworks',
          assetCaipNetwork.chainNamespace
        )
        if (
          approvedCaipNetworkIds?.includes(assetCaipNetwork.caipNetworkId) ||
          isSupportingAllNetworks
        ) {
          await ChainController.switchActiveNetwork(assetCaipNetwork)
        }
      } catch (error) {
        SnackController.showError('Unable to switch network to the configured asset network')

        return
      }
    }

    try {
      state.isPaymentInProgress = true
      await ModalController.open({
        view: 'PayLoading'
      })
      if (chainNamespace === ConstantsUtil.CHAIN.EVM) {
        if (state.paymentAsset.asset === 'native') {
          const amount = state.paymentAsset.amount / Number(10 ** 18)
          const res = await ConnectionController.sendTransaction({
            chainNamespace,
            to: state.paymentAsset.recipient as `0x${string}`,
            address: address as `0x${string}`,
            value: BigInt(amount),
            data: '0x'
          })
          // eslint-disable-next-line no-console
          console.log('res', { res })
        }
        if (state.paymentAsset.asset.startsWith('0x')) {
          const tokenAddress = state.paymentAsset.asset as `0x${string}`
          const amount = ConnectionController.parseUnits(
            state.paymentAsset.amount.toString(),
            Number(state.paymentAsset.metadata.decimals)
          )
          await ConnectionController.writeContract({
            fromAddress: AccountController.state.address as `0x${string}`,
            tokenAddress,
            args: [state.paymentAsset.recipient as `0x${string}`, amount ?? BigInt(0)],
            method: 'transfer',
            abi: ContractUtil.getERC20Abi(tokenAddress),
            chainNamespace: 'eip155'
          })
        }
      }
    } catch (error) {
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
    const caipAddress = AccountController.state.caipAddress
    if (!caipAddress) {
      return
    }
    const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
    const chainNamespace = ChainController.state.activeChain as ChainNamespace
    if (!address || !chainId || !chainNamespace) {
      RouterController.push('Connect')
    }
    this.handlePayment()
  }
}
