import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type CaipNetworkId } from '@reown/appkit-common'
import {
  AccountController,
  CoreHelperUtil,
  EventsController,
  SnackController
} from '@reown/appkit-controllers'

import { formatCaip19Asset, getExchanges, getPayUrl } from '../utils/ExchangeUtil.js'
import type { Exchange, GetExchangesParams, PayUrlParams } from '../utils/ExchangeUtil.js'

const DEFAULT_PAGE = 0
const DEFAULT_STATE: PayControllerState = {
  paymentAsset: {
    network: 'eip155:1',
    asset: '0x0',
    metadata: {
      name: '0x0',
      symbol: '0x0',
      decimals: 0
    }
  },
  amount: 0,
  error: null,
  exchanges: [],
  isLoading: false,
  currentPayment: undefined
}

// -- Types --------------------------------------------- //
type PayStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'

type OpenPayUrlParams = {
  exchangeId: string
  openInNewTab?: boolean
}

export type CurrentPayment = {
  type: PaymentType
  exchangeId?: string
  sessionId?: string
  status?: PayStatus
  result?: string
}
export type PayResult = CurrentPayment['result']

export interface PayControllerState {
  amount: number
  error: string | null
  isLoading: boolean
  exchanges: Exchange[]
  currentPayment?: CurrentPayment
  paymentAsset: {
    network: CaipNetworkId
    asset: string
    metadata: {
      name: string
      symbol: string
      decimals: number
    }
  }
}

type StateKey = keyof PayControllerState
type PaymentType = 'wallet' | 'exchange'

// -- State --------------------------------------------- //
const state = proxy<PayControllerState>({
  paymentAsset: {
    network: 'eip155:1',
    asset: '0x0',
    metadata: {
      name: '0x0',
      symbol: '0x0',
      decimals: 0
    }
  },
  amount: 0,
  error: null,
  exchanges: [],
  isLoading: false,
  currentPayment: undefined
})

// -- Controller ---------------------------------------- //
export const ExchangeController = {
  state,

  // -- Subscriptions ----------------------------------- //
  subscribe(callback: (newState: PayControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: PayControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  resetState() {
    Object.assign(state, { ...DEFAULT_STATE })
  },

  // -- Getters ----------------------------------------- //
  getExchanges() {
    return state.exchanges
  },

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

  async getAvailableExchanges(params?: GetExchangesParams) {
    try {
      const asset =
        params?.asset && params?.network
          ? formatCaip19Asset(params.network, params.asset)
          : undefined

      const response = await getExchanges({
        page: params?.page ?? DEFAULT_PAGE,
        asset,
        amount: params?.amount?.toString()
      })

      return response
    } catch (error) {
      throw new Error('Unable to get exchanges')
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

  async openPayUrl(openParams: OpenPayUrlParams, params: PayUrlParams) {
    try {
      const payUrl = await this.getPayUrl(openParams.exchangeId, params)
      if (!payUrl) {
        throw new Error('Unable to get pay url')
      }

      const target = openParams.openInNewTab ? '_blank' : '_self'
      CoreHelperUtil.openHref(payUrl.url, target)

      return payUrl
    } catch (error) {
      state.error = 'Unable to get pay url'
      throw new Error('Unable to get pay url')
    }
  },

  getExchangeById(exchangeId: string) {
    return state.exchanges.find(exchange => exchange.id === exchangeId)
  },

  async handlePayWithExchange(exchangeId: string) {
    try {
      if (!AccountController.state.caipAddress) {
        throw new Error('No account connected')
      }

      state.currentPayment = {
        type: 'exchange',
        exchangeId
      }

      const { network, asset } = state.paymentAsset
      const payUrlParams: PayUrlParams = {
        network,
        asset,
        amount: state.amount,
        recipient: AccountController.state.caipAddress
      }
      const payUrl = await this.getPayUrl(exchangeId, payUrlParams)
      if (!payUrl) {
        throw new Error('Unable to initiate payment')
      }

      state.currentPayment.sessionId = payUrl.sessionId
      state.currentPayment.status = 'IN_PROGRESS'
      state.currentPayment.exchangeId = exchangeId

      return {
        url: payUrl.url,
        openInNewTab: true
      }
    } catch (error) {
      state.error = 'Unable to initiate payment'
      SnackController.showError(state.error)

      return null
    }
  }
}
