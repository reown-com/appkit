import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type CaipNetworkId, NumberUtil } from '@reown/appkit-common'

import { getActiveNetworkTokenAddress } from '../utils/ChainControllerUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import {
  type GetBuyStatusResult,
  formatCaip19Asset,
  getBuyStatus,
  getExchanges,
  getPayUrl,
  getPaymentAssetsForNetwork
} from '../utils/ExchangeUtil.js'
import type { CurrentPayment, Exchange, PayUrlParams, PaymentAsset } from '../utils/ExchangeUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController } from './ChainController.js'
import { EventsController } from './EventsController.js'
import { OptionsController } from './OptionsController.js'
import { SnackController } from './SnackController.js'

// -- Constants ----------------------------------------- //
const DEFAULT_PAGE = 0
export const DEFAULT_STATE: ExchangeControllerState = {
  paymentAsset: null,
  amount: null,
  tokenAmount: 0,
  priceLoading: false,
  error: null,
  exchanges: [],
  isLoading: false,
  currentPayment: undefined,
  isPaymentInProgress: false,
  paymentId: '',
  assets: []
}

// -- Types --------------------------------------------- //
export interface ExchangeControllerState {
  amount: number | null
  tokenAmount: number
  priceLoading: boolean
  error: string | null
  isLoading: boolean
  exchanges: Exchange[]
  currentPayment?: CurrentPayment
  paymentAsset: PaymentAsset | null
  isPaymentInProgress: boolean
  paymentId: string
  assets: PaymentAsset[]
}

type StateKey = keyof ExchangeControllerState

// -- State --------------------------------------------- //
const state = proxy<ExchangeControllerState>(DEFAULT_STATE)

// -- Controller ---------------------------------------- //
export const ExchangeController = {
  state,

  // -- Subscriptions ----------------------------------- //
  subscribe(callback: (newState: ExchangeControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ExchangeControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  resetState() {
    Object.assign(state, { ...DEFAULT_STATE })
  },

  async getAssetsForNetwork(network: CaipNetworkId) {
    const assets = getPaymentAssetsForNetwork(network)
    const metadata = await ExchangeController.getAssetsImageAndPrice(assets)
    const assetsWithPrice = assets.map(asset => {
      const assetAddress =
        asset.asset === 'native'
          ? getActiveNetworkTokenAddress()
          : `${asset.network}:${asset.asset}`
      const assetMetadata = metadata.find(
        m => m.fungibles?.[0]?.address?.toLowerCase() === assetAddress.toLowerCase()
      )

      return {
        ...asset,
        price: assetMetadata?.fungibles?.[0]?.price || 1,
        metadata: {
          ...asset.metadata,
          iconUrl: assetMetadata?.fungibles?.[0]?.iconUrl
        }
      }
    })

    state.assets = assetsWithPrice

    return assetsWithPrice
  },

  async getAssetsImageAndPrice(assets: PaymentAsset[]) {
    const addresses = assets.map(asset =>
      asset.asset === 'native' ? getActiveNetworkTokenAddress() : `${asset.network}:${asset.asset}`
    )

    const metadata = await Promise.all(
      addresses.map(address => BlockchainApiController.fetchTokenPrice({ addresses: [address] }))
    )

    return metadata
  },

  getTokenAmount() {
    if (!state?.paymentAsset?.price) {
      throw new Error('Cannot get token price')
    }

    const bigAmount = NumberUtil.bigNumber(state.amount ?? 0).round(8)
    const bigPrice = NumberUtil.bigNumber(state.paymentAsset.price).round(8)

    return bigAmount.div(bigPrice).round(8).toNumber()
  },

  setAmount(amount: number | null) {
    state.amount = amount
    if (state.paymentAsset?.price) {
      state.tokenAmount = ExchangeController.getTokenAmount()
    }
  },

  setPaymentAsset(asset: PaymentAsset) {
    state.paymentAsset = asset
  },

  isPayWithExchangeEnabled() {
    return (
      OptionsController.state.remoteFeatures?.payWithExchange ||
      OptionsController.state.remoteFeatures?.payments ||
      OptionsController.state.features?.pay
    )
  },

  isPayWithExchangeSupported() {
    return (
      ExchangeController.isPayWithExchangeEnabled() &&
      ChainController.state.activeCaipNetwork &&
      ConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(
        ChainController.state.activeCaipNetwork.chainNamespace
      )
    )
  },

  // -- Getters ----------------------------------------- //
  async fetchExchanges() {
    try {
      const isPayWithExchangeSupported = ExchangeController.isPayWithExchangeSupported()

      if (!state.paymentAsset || !isPayWithExchangeSupported) {
        state.exchanges = []
        state.isLoading = false

        return
      }

      state.isLoading = true
      const response = await getExchanges({
        page: DEFAULT_PAGE,
        asset: formatCaip19Asset(state.paymentAsset.network, state.paymentAsset.asset),
        amount: state.amount?.toString() ?? '0'
      })
      // Putting this here in order to maintain backawrds compatibility with the UI when we introduce more exchanges
      state.exchanges = response.exchanges.slice(0, 2)
    } catch (error) {
      SnackController.showError('Unable to get exchanges')
      throw new Error('Unable to get exchanges')
    } finally {
      state.isLoading = false
    }
  },

  async getPayUrl(exchangeId: string, params: PayUrlParams) {
    try {
      const numericAmount = Number(params.amount)

      const response = await getPayUrl({
        exchangeId,
        asset: formatCaip19Asset(params.network, params.asset),
        amount: numericAmount.toString(),
        recipient: `${params.network}:${params.recipient}`
      })

      EventsController.sendEvent({
        type: 'track',
        event: 'PAY_EXCHANGE_SELECTED',
        properties: {
          exchange: {
            id: exchangeId
          },
          configuration: {
            network: params.network,
            asset: params.asset,
            recipient: params.recipient,
            amount: numericAmount
          },
          currentPayment: {
            type: 'exchange',
            exchangeId
          },
          source: 'fund-from-exchange',
          headless: false
        }
      })

      return response
    } catch (error) {
      if (error instanceof Error && error.message.includes('is not supported')) {
        throw new Error('Asset not supported')
      }
      throw new Error((error as Error).message)
    }
  },

  async handlePayWithExchange(exchangeId: string) {
    try {
      const address = ChainController.getAccountData()?.address
      if (!address) {
        throw new Error('No account connected')
      }

      if (!state.paymentAsset) {
        throw new Error('No payment asset selected')
      }

      const popupWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'scrollbar=yes,width=480,height=720'
      )

      if (!popupWindow) {
        throw new Error('Could not create popup window')
      }

      state.isPaymentInProgress = true
      state.paymentId = crypto.randomUUID()

      state.currentPayment = {
        type: 'exchange',
        exchangeId
      }

      const { network, asset } = state.paymentAsset
      const payUrlParams: PayUrlParams = {
        network,
        asset,
        amount: state.tokenAmount,
        recipient: address
      }
      const payUrl = await ExchangeController.getPayUrl(exchangeId, payUrlParams)
      if (!payUrl) {
        try {
          popupWindow.close()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Unable to close popup window', err)
        }

        throw new Error('Unable to initiate payment')
      }

      state.currentPayment.sessionId = payUrl.sessionId
      state.currentPayment.status = 'IN_PROGRESS'
      state.currentPayment.exchangeId = exchangeId

      popupWindow.location.href = payUrl.url
    } catch (error) {
      state.error = 'Unable to initiate payment'
      SnackController.showError(state.error)
    }
  },

  async waitUntilComplete({
    exchangeId,
    sessionId,
    paymentId,
    retries = 20
  }: {
    exchangeId: string
    sessionId: string
    paymentId: string
    retries?: number
  }): Promise<GetBuyStatusResult> {
    const status = await ExchangeController.getBuyStatus(exchangeId, sessionId, paymentId)
    if (status.status === 'SUCCESS' || status.status === 'FAILED') {
      return status
    }

    if (retries === 0) {
      throw new Error('Unable to get deposit status')
    }

    // Wait 5 seconds before checking again
    await new Promise(resolve => {
      setTimeout(resolve, 5000)
    })

    return ExchangeController.waitUntilComplete({
      exchangeId,
      sessionId,
      paymentId,
      retries: retries - 1
    })
  },

  async getBuyStatus(exchangeId: string, sessionId: string, paymentId: string) {
    try {
      if (!state.currentPayment) {
        throw new Error('No current payment')
      }

      const status = await getBuyStatus({ sessionId, exchangeId })
      state.currentPayment.status = status.status
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        const address = ChainController.getAccountData()?.address
        state.currentPayment.result = status.txHash
        state.isPaymentInProgress = false
        EventsController.sendEvent({
          type: 'track',
          event: status.status === 'SUCCESS' ? 'PAY_SUCCESS' : 'PAY_ERROR',
          properties: {
            message:
              status.status === 'FAILED' ? CoreHelperUtil.parseError(state.error) : undefined,
            source: 'fund-from-exchange',
            paymentId,
            configuration: {
              network: state.paymentAsset?.network || '',
              asset: state.paymentAsset?.asset || '',
              recipient: address || '',
              amount: state.amount ?? 0
            },
            currentPayment: {
              type: 'exchange',
              exchangeId: state.currentPayment?.exchangeId,
              sessionId: state.currentPayment?.sessionId,
              result: status.txHash
            }
          }
        })
      }

      return status
    } catch (error) {
      return {
        status: 'UNKNOWN',
        txHash: ''
      } as GetBuyStatusResult
    }
  },
  reset() {
    state.currentPayment = undefined
    state.isPaymentInProgress = false
    state.paymentId = ''
    state.paymentAsset = null
    state.amount = 0
    state.tokenAmount = 0
    state.priceLoading = false
    state.error = null
    state.exchanges = []
    state.isLoading = false
  }
}
