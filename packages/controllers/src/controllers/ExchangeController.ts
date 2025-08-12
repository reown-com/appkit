import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type CaipNetworkId } from '@reown/appkit-common'

import { getActiveNetworkTokenAddress } from '../utils/ChainControllerUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import {
  type GetBuyStatusResult,
  formatCaip19Asset,
  getBuyStatus,
  getExchanges,
  getPayUrl
} from '../utils/ExchangeUtil.js'
import type { Exchange, PayUrlParams } from '../utils/ExchangeUtil.js'
import { AccountController } from './AccountController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { EventsController } from './EventsController.js'
import { SnackController } from './SnackController.js'

// -- Constants ----------------------------------------- //
const DEFAULT_PAGE = 0
const DEFAULT_STATE: ExchangeControllerState = {
  paymentAsset: {
    network: 'eip155:1',
    asset: 'native',
    metadata: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 0
    }
  },
  amount: 0,
  tokenAmount: 0,
  tokenPrice: null,
  priceLoading: false,
  error: null,
  exchanges: [],
  isLoading: false,
  currentPayment: undefined,
  isPaymentInProgress: false,
  paymentId: ''
}

// -- Types --------------------------------------------- //
type PayStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'

export type CurrentPayment = {
  type: PaymentType
  exchangeId?: string
  sessionId?: string
  status?: PayStatus
  result?: string
}
export type PayResult = CurrentPayment['result']

export type PaymentAsset = {
  network: CaipNetworkId
  asset: string
  metadata: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface ExchangeControllerState {
  amount: number
  tokenAmount: number
  tokenPrice: number | null
  priceLoading: boolean
  error: string | null
  isLoading: boolean
  exchanges: Exchange[]
  currentPayment?: CurrentPayment
  paymentAsset: PaymentAsset
  isPaymentInProgress: boolean
  paymentId: string
}

type StateKey = keyof ExchangeControllerState
type PaymentType = 'wallet' | 'exchange'

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

  async fetchTokenPrice() {
    state.priceLoading = true
    const tokenAddress = getActiveNetworkTokenAddress()
    const result = await BlockchainApiController.fetchTokenPrice({ addresses: [tokenAddress] })
    state.tokenPrice = result.fungibles?.[0]?.price || null
    state.priceLoading = false
  },

  getTokenAmount() {
    if (!state.tokenPrice) {
      throw new Error('Cannot get token price')
    }

    const tokenAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    }).format(state.amount / state.tokenPrice)

    return Number(tokenAmount)
  },

  setAmount(amount: number) {
    state.amount = amount
    if (state.tokenPrice) {
      state.tokenAmount = this.getTokenAmount()
    }
  },

  setPaymentAsset(asset: PaymentAsset) {
    state.paymentAsset = asset
  },

  // -- Getters ----------------------------------------- //
  async fetchExchanges() {
    try {
      state.isLoading = true
      const response = await getExchanges({
        page: DEFAULT_PAGE,
        asset: formatCaip19Asset(state.paymentAsset.network, state.paymentAsset.asset),
        amount: state.amount.toString()
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
      if (!AccountController.state.address) {
        throw new Error('No account connected')
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
        recipient: AccountController.state.address
      }
      const payUrl = await this.getPayUrl(exchangeId, payUrlParams)
      if (!payUrl) {
        throw new Error('Unable to initiate payment')
      }

      state.currentPayment.sessionId = payUrl.sessionId
      state.currentPayment.status = 'IN_PROGRESS'
      state.currentPayment.exchangeId = exchangeId

      CoreHelperUtil.openHref(payUrl.url, '_blank')
    } catch (error) {
      state.error = 'Unable to initiate payment'
      SnackController.showError(state.error)
    }
  },

  async waitUntilComplete(
    exchangeId: string,
    sessionId: string,
    paymentId: string
  ): Promise<GetBuyStatusResult> {
    const status = await this.getBuyStatus(exchangeId, sessionId, paymentId)

    if (status.status === 'SUCCESS' || status.status === 'FAILED') {
      return status
    }

    // Wait 1 second before checking again
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    return this.waitUntilComplete(exchangeId, sessionId, paymentId)
  },

  async getBuyStatus(exchangeId: string, sessionId: string, paymentId: string) {
    try {
      if (!state.currentPayment) {
        throw new Error('No current payment')
      }

      const status = await getBuyStatus({ sessionId, exchangeId })
      state.currentPayment.status = status.status
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        state.currentPayment.result = status.txHash
        state.isPaymentInProgress = false
        EventsController.sendEvent({
          type: 'track',
          event: status.status === 'SUCCESS' ? 'PAY_SUCCESS' : 'PAY_ERROR',
          properties: {
            source: 'fund-from-exchange',
            paymentId,
            configuration: {
              network: state.paymentAsset.network,
              asset: state.paymentAsset.asset,
              recipient: AccountController.state.address || '',
              amount: state.amount
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
      throw new Error('Unable to get buy status')
    }
  }
}
