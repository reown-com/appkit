import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type Address, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  ProviderController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import {
  AppKitPayErrorCodes,
  type AppKitPayErrorMessage,
  AppKitPayErrorMessages
} from '../types/errors.js'
import { AppKitPayError } from '../types/errors.js'
import type { Exchange } from '../types/exchange.js'
import type { GetExchangesParams, PayUrlParams, PaymentOptions } from '../types/options.js'
import { getBuyStatus, getExchanges, getPayUrl } from '../utils/ApiUtil.js'
import { formatCaip19Asset } from '../utils/AssetUtil.js'
import {
  ensureCorrectNetwork,
  processEvmErc20Payment,
  processEvmNativePayment,
  processSolanaPayment
} from '../utils/PaymentUtil.js'

const DEFAULT_PAGE = 0
const DEFAULT_PAYMENT_ID = 'unknown'

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

export interface PayControllerState extends PaymentOptions {
  isConfigured: boolean
  error: AppKitPayErrorMessage | null
  isPaymentInProgress: boolean
  isLoading: boolean
  exchanges: Exchange[]
  currentPayment?: CurrentPayment
  analyticsSet: boolean
  paymentId?: string
}

// Define a type for the parameters passed to getPayUrl

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
  recipient: '0x0',
  amount: 0,
  isConfigured: false,
  error: null,
  isPaymentInProgress: false,
  exchanges: [],
  isLoading: false,
  openInNewTab: true,
  redirectUrl: undefined,
  payWithExchange: undefined,
  currentPayment: undefined,
  analyticsSet: false,
  paymentId: undefined
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
    this.initializeAnalytics()
    state.isConfigured = true
    EventsController.sendEvent({
      type: 'track',
      event: 'PAY_MODAL_OPEN',
      properties: {
        exchanges: state.exchanges,
        configuration: {
          network: state.paymentAsset.network,
          asset: state.paymentAsset.asset,
          recipient: state.recipient,
          amount: state.amount
        }
      }
    })
    await ModalController.open({
      view: 'Pay'
    })
  },

  resetState() {
    state.paymentAsset = {
      network: 'eip155:1',
      asset: '0x0',
      metadata: { name: '0x0', symbol: '0x0', decimals: 0 }
    }
    state.recipient = '0x0'
    state.amount = 0
    state.isConfigured = false
    state.error = null
    state.isPaymentInProgress = false
    state.isLoading = false
    state.currentPayment = undefined
  },

  // -- Setters ----------------------------------------- //
  setPaymentConfig(config: PaymentOptions) {
    if (!config.paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    try {
      state.paymentAsset = config.paymentAsset
      state.recipient = config.recipient
      state.amount = config.amount
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
        page: DEFAULT_PAGE,
        asset: formatCaip19Asset(state.paymentAsset.network, state.paymentAsset.asset),
        amount: state.amount.toString()
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
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)
    }
  },

  async getPayUrl(exchangeId: string, params: PayUrlParams, headless = false) {
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
          source: 'pay',
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
          headless
        }
      })
      if (headless) {
        this.initiatePayment()
        EventsController.sendEvent({
          type: 'track',
          event: 'PAY_INITIATED',
          properties: {
            source: 'pay',
            paymentId: state.paymentId || DEFAULT_PAYMENT_ID,
            configuration: {
              network: params.network,
              asset: params.asset,
              recipient: params.recipient,
              amount: numericAmount
            },
            currentPayment: {
              type: 'exchange',
              exchangeId
            }
          }
        })
      }

      return response
    } catch (error) {
      if (error instanceof Error && error.message.includes('is not supported')) {
        throw new AppKitPayError(AppKitPayErrorCodes.ASSET_NOT_SUPPORTED)
      }
      throw new Error((error as Error).message)
    }
  },

  async openPayUrl(openParams: OpenPayUrlParams, params: PayUrlParams, headless = false) {
    try {
      const payUrl = await this.getPayUrl(openParams.exchangeId, params, headless)
      if (!payUrl) {
        throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)
      }
      const shouldOpenInNewTab = openParams.openInNewTab ?? true

      const target = shouldOpenInNewTab ? '_blank' : '_self'
      CoreHelperUtil.openHref(payUrl.url, target)

      return payUrl
    } catch (error) {
      if (error instanceof AppKitPayError) {
        state.error = error.message
      } else {
        state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      }
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_PAY_URL)
    }
  },

  subscribeEvents() {
    if (state.isConfigured) {
      return
    }

    ConnectionController.subscribeKey('connections', connections => {
      if (connections.size > 0) {
        this.handlePayment()
      }
    })

    ChainController.subscribeChainProp('accountState', accountState => {
      const hasWcConnection = ConnectionController.hasAnyConnection(
        ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
      )
      if (accountState?.caipAddress) {
        // WalletConnect connections sometimes fail down the line due to state not being updated atomically
        if (hasWcConnection) {
          setTimeout(() => {
            this.handlePayment()
          }, 100)
        } else {
          this.handlePayment()
        }
      }
    })
  },
  async handlePayment() {
    state.currentPayment = {
      type: 'wallet',
      status: 'IN_PROGRESS'
    }
    const caipAddress = ChainController.getActiveCaipAddress()
    if (!caipAddress) {
      return
    }

    const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
    const chainNamespace = ChainController.state.activeChain

    if (!address || !chainId || !chainNamespace) {
      return
    }

    const provider = ProviderController.getProvider(chainNamespace)

    if (!provider) {
      return
    }

    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!caipNetwork) {
      return
    }

    if (state.isPaymentInProgress) {
      return
    }

    try {
      this.initiatePayment()

      const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
      const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()

      await ensureCorrectNetwork({
        paymentAssetNetwork: state.paymentAsset.network,
        activeCaipNetwork: caipNetwork,
        approvedCaipNetworkIds,
        requestedCaipNetworks
      })

      await ModalController.open({
        view: 'PayLoading'
      })

      switch (chainNamespace) {
        case ConstantsUtil.CHAIN.EVM:
          if (state.paymentAsset.asset === 'native') {
            state.currentPayment.result = await processEvmNativePayment(
              state.paymentAsset,
              chainNamespace,
              {
                recipient: state.recipient as Address,
                amount: state.amount,
                fromAddress: address as Address
              }
            )
          }
          if (state.paymentAsset.asset.startsWith('0x')) {
            state.currentPayment.result = await processEvmErc20Payment(state.paymentAsset, {
              recipient: state.recipient as Address,
              amount: state.amount,
              fromAddress: address as Address
            })
          }
          state.currentPayment.status = 'SUCCESS'
          break
        case ConstantsUtil.CHAIN.SOLANA:
          state.currentPayment.result = await processSolanaPayment(chainNamespace, {
            recipient: state.recipient,
            amount: state.amount,
            fromAddress: address,
            // If the tokenMint is provided, provider will use it to create a SPL token transaction
            tokenMint: state.paymentAsset.asset === 'native' ? undefined : state.paymentAsset.asset
          })
          state.currentPayment.status = 'SUCCESS'
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
      state.currentPayment.status = 'FAILED'
      SnackController.showError(state.error)
    } finally {
      state.isPaymentInProgress = false
    }
  },

  getExchangeById(exchangeId: string) {
    return state.exchanges.find(exchange => exchange.id === exchangeId)
  },

  validatePayConfig(config: PaymentOptions) {
    const { paymentAsset, recipient, amount } = config

    if (!paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    if (!recipient) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_RECIPIENT)
    }

    if (!paymentAsset.asset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_ASSET)
    }

    if (amount === undefined || amount === null || amount <= 0) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_AMOUNT)
    }
  },

  handlePayWithWallet() {
    const caipAddress = ChainController.getActiveCaipAddress()
    if (!caipAddress) {
      RouterController.push('Connect')

      return
    }
    const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
    const chainNamespace = ChainController.state.activeChain
    if (!address || !chainId || !chainNamespace) {
      RouterController.push('Connect')

      return
    }
    this.handlePayment()
  },

  async handlePayWithExchange(exchangeId: string) {
    try {
      state.currentPayment = {
        type: 'exchange',
        exchangeId
      }

      const { network, asset } = state.paymentAsset
      const payUrlParams: PayUrlParams = {
        network,
        asset,
        amount: state.amount,
        recipient: state.recipient
      }
      const payUrl = await this.getPayUrl(exchangeId, payUrlParams)
      if (!payUrl) {
        throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT)
      }

      state.currentPayment.sessionId = payUrl.sessionId
      state.currentPayment.status = 'IN_PROGRESS'
      state.currentPayment.exchangeId = exchangeId
      this.initiatePayment()

      return {
        url: payUrl.url,
        openInNewTab: state.openInNewTab
      }
    } catch (error) {
      if (error instanceof AppKitPayError) {
        state.error = error.message
      } else {
        state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      }
      state.isPaymentInProgress = false
      SnackController.showError(state.error)

      return null
    }
  },

  async getBuyStatus(exchangeId: string, sessionId: string) {
    try {
      const status = await getBuyStatus({ sessionId, exchangeId })
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        EventsController.sendEvent({
          type: 'track',
          event: status.status === 'SUCCESS' ? 'PAY_SUCCESS' : 'PAY_ERROR',
          properties: {
            message:
              status.status === 'FAILED' ? CoreHelperUtil.parseError(state.error) : undefined,
            source: 'pay',
            paymentId: state.paymentId || DEFAULT_PAYMENT_ID,
            configuration: {
              network: state.paymentAsset.network,
              asset: state.paymentAsset.asset,
              recipient: state.recipient,
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
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_BUY_STATUS)
    }
  },

  async updateBuyStatus(exchangeId: string, sessionId: string) {
    try {
      const status = await this.getBuyStatus(exchangeId, sessionId)

      if (state.currentPayment) {
        state.currentPayment.status = status.status
        state.currentPayment.result = status.txHash
      }
      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        state.isPaymentInProgress = false
      }
    } catch (error) {
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_BUY_STATUS)
    }
  },

  initiatePayment() {
    state.isPaymentInProgress = true
    state.paymentId = crypto.randomUUID()
  },

  initializeAnalytics() {
    if (state.analyticsSet) {
      return
    }
    state.analyticsSet = true
    this.subscribeKey('isPaymentInProgress', _ => {
      if (state.currentPayment?.status && state.currentPayment.status !== 'UNKNOWN') {
        const eventType = {
          IN_PROGRESS: 'PAY_INITIATED',
          SUCCESS: 'PAY_SUCCESS',
          FAILED: 'PAY_ERROR'
        }[state.currentPayment.status]

        EventsController.sendEvent({
          type: 'track',
          event: eventType as 'PAY_INITIATED' | 'PAY_SUCCESS' | 'PAY_ERROR',
          properties: {
            message:
              state.currentPayment.status === 'FAILED'
                ? CoreHelperUtil.parseError(state.error)
                : undefined,
            source: 'pay',
            paymentId: state.paymentId || DEFAULT_PAYMENT_ID,
            configuration: {
              network: state.paymentAsset.network,
              asset: state.paymentAsset.asset,
              recipient: state.recipient,
              amount: state.amount
            },
            currentPayment: {
              type: state.currentPayment.type,
              exchangeId: state.currentPayment.exchangeId,
              sessionId: state.currentPayment.sessionId,
              result: state.currentPayment.result
            }
          }
        })
      }
    })
  }
}
