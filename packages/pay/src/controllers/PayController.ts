import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type Address,
  type Balance,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  NumberUtil,
  ParseUtil
} from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  SnackController
} from '@reown/appkit-controllers'
import { BalanceUtil } from '@reown/appkit-controllers/utils'
import { HelpersUtil } from '@reown/appkit-utils'

import {
  AppKitPayErrorCodes,
  type AppKitPayErrorMessage,
  AppKitPayErrorMessages
} from '../types/errors.js'
import { AppKitPayError } from '../types/errors.js'
import type { Exchange } from '../types/exchange.js'
import type {
  GetExchangesParams,
  PayUrlParams,
  PaymentAsset,
  PaymentAssetWithAmount,
  PaymentChoice,
  PaymentOptions
} from '../types/options.js'
import type { Quote, QuoteStatus, QuoteTransactionStep } from '../types/quote.js'
import {
  getAssetsForExchange,
  getBuyStatus,
  getExchanges,
  getPayUrl,
  getQuote,
  getQuoteStatus
} from '../utils/ApiUtil.js'
import { formatCaip19Asset, formatPaymentAssetToBalance } from '../utils/AssetUtil.js'
import {
  ensureCorrectAddress,
  getTransferStep,
  processEvmErc20Payment,
  processEvmNativePayment,
  processSolanaPayment
} from '../utils/PaymentUtil.js'

const DEFAULT_PAGE = 0
const DEFAULT_PAYMENT_ID = 'unknown'

export const DIRECT_TRANSFER_REQUEST_ID = 'direct-transfer'
export const DIRECT_TRANSFER_DEPOSIT_TYPE = 'deposit'
export const DIRECT_TRANSFER_TRANSACTION_TYPE = 'transaction'

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
  choice: PaymentChoice
  tokenBalances: Partial<Record<ChainNamespace, Balance[]>>
  isFetchingTokenBalances: boolean
  selectedPaymentAsset: PaymentAssetWithAmount | null
  quote?: Quote
  quoteStatus: QuoteStatus
  quoteError: string | null
  isFetchingQuote: boolean
  selectedExchange?: Exchange
  exchangeUrlForQuote?: string
  exchangeSessionId?: string
  requestId?: string
}

interface FetchTokensParams {
  caipAddress?: CaipAddress
  caipNetwork?: CaipNetwork
  namespace: ChainNamespace
}

interface FetchQuoteParams {
  address?: string
  sourceToken: PaymentAsset
  toToken: PaymentAsset
  recipient: string
  amount: string
}

interface FetchQuoteStatusParams {
  requestId: string
}

interface OnTransferParams {
  chainNamespace: ChainNamespace
  fromAddress: string
  toAddress: string
  amount: number | string
  paymentAsset: PaymentAsset
}

interface GenerateExchangeUrlForQuoteParams {
  exchangeId: string
  paymentAsset: PaymentAsset
  amount: number | string
  recipient: string
}

interface FetchTokensFromEOAParams {
  caipAddress?: CaipAddress
  caipNetwork?: CaipNetwork
  namespace: ChainNamespace
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
  paymentId: undefined,
  choice: 'pay',
  tokenBalances: {
    [ConstantsUtil.CHAIN.EVM]: [],
    [ConstantsUtil.CHAIN.SOLANA]: []
  },
  isFetchingTokenBalances: false,
  selectedPaymentAsset: null,
  quote: undefined,
  quoteStatus: 'waiting',
  quoteError: null,
  isFetchingQuote: false,
  selectedExchange: undefined,
  exchangeUrlForQuote: undefined,
  requestId: undefined
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
    this.initializeAnalytics()
    ensureCorrectAddress()
    await this.prepareTokenLogo()
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
    state.selectedExchange = undefined
    state.exchangeUrlForQuote = undefined
    state.requestId = undefined
  },

  resetQuoteState() {
    state.quote = undefined
    state.quoteStatus = 'waiting'
    state.quoteError = null
    state.isFetchingQuote = false
    state.requestId = undefined
  },

  // -- Setters ----------------------------------------- //
  setPaymentConfig(config: PaymentOptions) {
    if (!config.paymentAsset) {
      throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
    }

    try {
      state.choice = config.choice ?? 'pay'
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

  setSelectedPaymentAsset(paymentAsset: PaymentAssetWithAmount | null) {
    state.selectedPaymentAsset = paymentAsset
  },

  setSelectedExchange(exchange?: Exchange) {
    state.selectedExchange = exchange
  },

  setRequestId(requestId: string) {
    state.requestId = requestId
  },

  setPaymentInProgress(isPaymentInProgress: boolean) {
    state.isPaymentInProgress = isPaymentInProgress
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

  async generateExchangeUrlForQuote({
    exchangeId,
    paymentAsset,
    amount,
    recipient
  }: GenerateExchangeUrlForQuoteParams) {
    const response = await getPayUrl({
      exchangeId,
      asset: formatCaip19Asset(paymentAsset.network, paymentAsset.asset),
      amount: amount.toString(),
      recipient
    })

    state.exchangeSessionId = response.sessionId
    state.exchangeUrlForQuote = response.url
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

  async onTransfer({
    chainNamespace,
    fromAddress,
    toAddress,
    amount,
    paymentAsset
  }: OnTransferParams) {
    state.currentPayment = {
      type: 'wallet',
      status: 'IN_PROGRESS'
    }

    if (state.isPaymentInProgress) {
      return
    }

    try {
      this.initiatePayment()

      const allNetworks = ChainController.getAllRequestedCaipNetworks()
      const targetNetwork = allNetworks.find(net => net.caipNetworkId === paymentAsset.network)

      if (!targetNetwork) {
        throw new Error('Target network not found')
      }

      const caipNetwork = ChainController.state.activeCaipNetwork

      if (!HelpersUtil.isLowerCaseMatch(caipNetwork?.caipNetworkId, targetNetwork.caipNetworkId)) {
        await ChainController.switchActiveNetwork(targetNetwork)
      }

      switch (chainNamespace) {
        case ConstantsUtil.CHAIN.EVM:
          if (paymentAsset.asset === 'native') {
            state.currentPayment.result = await processEvmNativePayment(
              paymentAsset,
              chainNamespace,
              {
                recipient: toAddress as Address,
                amount,
                fromAddress: fromAddress as Address
              }
            )
          }
          if (paymentAsset.asset.startsWith('0x')) {
            state.currentPayment.result = await processEvmErc20Payment(paymentAsset, {
              recipient: toAddress as Address,
              amount,
              fromAddress: fromAddress as Address
            })
          }
          state.currentPayment.status = 'SUCCESS'
          break
        case ConstantsUtil.CHAIN.SOLANA:
          state.currentPayment.result = await processSolanaPayment(chainNamespace, {
            recipient: toAddress,
            amount,
            fromAddress,
            // If the tokenMint is provided, provider will use it to create a SPL token transaction
            tokenMint: paymentAsset.asset === 'native' ? undefined : paymentAsset.asset
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
      throw error
    } finally {
      state.isPaymentInProgress = false
    }
  },

  async onSendTransaction(params: {
    namespace: ChainNamespace
    transactionStep: QuoteTransactionStep
  }) {
    try {
      const { namespace, transactionStep } = params

      const { from, to, data, value } = transactionStep.transaction

      PayController.initiatePayment()

      const allNetworks = ChainController.getAllRequestedCaipNetworks()
      const targetNetwork = allNetworks.find(
        net => net.caipNetworkId === state.paymentAsset?.network
      )

      if (!targetNetwork) {
        throw new Error('Target network not found')
      }

      const caipNetwork = ChainController.state.activeCaipNetwork

      if (!HelpersUtil.isLowerCaseMatch(caipNetwork?.caipNetworkId, targetNetwork.caipNetworkId)) {
        await ChainController.switchActiveNetwork(targetNetwork)
      }

      if (namespace === ConstantsUtil.CHAIN.EVM) {
        await ConnectionController.sendTransaction({
          address: from,
          to,
          data,
          value: BigInt(value),
          chainNamespace: namespace
        })
      }
    } catch (error) {
      if (error instanceof AppKitPayError) {
        state.error = error.message
      } else {
        state.error = AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR
      }
      SnackController.showError(state.error)
      throw error
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

  async fetchTokensFromEOA({ caipAddress, caipNetwork, namespace }: FetchTokensFromEOAParams) {
    if (!caipAddress) {
      return []
    }

    const { address } = ParseUtil.parseCaipAddress(caipAddress)

    let overideCaipNetwork = caipNetwork

    if (namespace === ConstantsUtil.CHAIN.EVM) {
      overideCaipNetwork = undefined
    }

    const balances = await BalanceUtil.getMyTokensWithBalance({
      address,
      caipNetwork: overideCaipNetwork
    })

    return balances
  },

  async fetchTokensFromExchange() {
    if (!state.selectedExchange) {
      return []
    }

    const assets = await getAssetsForExchange(state.selectedExchange.id)
    const allAssets = Object.values(assets.assets).flat()

    const balanceWithImages = await Promise.all(
      allAssets.map(async token => {
        const balance = formatPaymentAssetToBalance(token)

        const { chainNamespace } = ParseUtil.parseCaipNetworkId(balance.chainId as CaipNetworkId)

        let address = balance.address

        if (CoreHelperUtil.isCaipAddress(address)) {
          const { address: parsedAddress } = ParseUtil.parseCaipAddress(address)
          address = parsedAddress
        }

        const image = await AssetUtil.getImageByToken(address ?? '', chainNamespace).catch(
          () => undefined
        )

        balance.iconUrl = image ?? ''

        return balance
      })
    )

    return balanceWithImages
  },

  async fetchTokens({ caipAddress, caipNetwork, namespace }: FetchTokensParams) {
    try {
      state.isFetchingTokenBalances = true

      const isUsingExchange = Boolean(state.selectedExchange)

      const balancesFnPromise = isUsingExchange
        ? this.fetchTokensFromExchange()
        : this.fetchTokensFromEOA({ caipAddress, caipNetwork, namespace })

      const balances = await balancesFnPromise

      // Convert into a new object to trigger a re-render
      state.tokenBalances = { ...state.tokenBalances, [namespace]: balances }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to get token balances'
      SnackController.showError(message)
    } finally {
      state.isFetchingTokenBalances = false
    }
  },

  async fetchQuote({ amount, address, sourceToken, toToken, recipient }: FetchQuoteParams) {
    try {
      PayController.resetQuoteState()

      state.isFetchingQuote = true

      const quote = await getQuote({
        amount,
        address: state.selectedExchange ? undefined : address,
        sourceToken,
        toToken,
        recipient
      })

      if (state.selectedExchange) {
        const transferStep = getTransferStep(quote)

        if (transferStep) {
          const caipDepositAddress = `${sourceToken.network}:${transferStep.deposit.receiver}`

          const depositAmount = NumberUtil.formatNumber(transferStep.deposit.amount, {
            decimals: sourceToken.metadata.decimals ?? 0,
            round: 8
          })

          await PayController.generateExchangeUrlForQuote({
            exchangeId: state.selectedExchange.id,
            paymentAsset: sourceToken,
            amount: depositAmount.toString(),
            recipient: caipDepositAddress
          })
        }
      }

      state.quote = quote
    } catch (err) {
      let errMessage = AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE

      if (err instanceof Error && err.cause && err.cause instanceof Response) {
        try {
          const errorData = await err.cause.json()

          if (errorData.error && typeof errorData.error === 'string') {
            errMessage = errorData.error
          }
        } catch {
          // Ignore
        }
      }

      state.quoteError = errMessage
      SnackController.showError(errMessage)
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE)
    } finally {
      state.isFetchingQuote = false
    }
  },

  async fetchQuoteStatus({ requestId }: FetchQuoteStatusParams) {
    try {
      if (requestId === DIRECT_TRANSFER_REQUEST_ID) {
        const selectedExchange = state.selectedExchange
        const sessionId = state.exchangeSessionId

        if (selectedExchange && sessionId) {
          const status = await this.getBuyStatus(selectedExchange.id, sessionId)

          switch (status.status) {
            case 'IN_PROGRESS':
              state.quoteStatus = 'waiting'
              break
            case 'SUCCESS':
              state.quoteStatus = 'success'
              state.isPaymentInProgress = false
              break
            case 'FAILED':
              state.quoteStatus = 'failure'
              state.isPaymentInProgress = false
              break
            case 'UNKNOWN':
              state.quoteStatus = 'waiting'
              break
            default:
              state.quoteStatus = 'waiting'
              break
          }

          return
        }

        state.quoteStatus = 'success'

        return
      }

      const { status } = await getQuoteStatus({ requestId })
      state.quoteStatus = status
    } catch {
      state.quoteStatus = 'failure'
      throw new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_QUOTE_STATUS)
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
  },

  async prepareTokenLogo() {
    if (!state.paymentAsset.metadata.logoURI) {
      try {
        const { chainNamespace } = ParseUtil.parseCaipNetworkId(state.paymentAsset.network)

        const imageUrl = await AssetUtil.getImageByToken(state.paymentAsset.asset, chainNamespace)

        state.paymentAsset.metadata.logoURI = imageUrl
      } catch {
        // Ignore
      }
    }
  }
}
