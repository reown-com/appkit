/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable no-inner-declarations */
/* eslint-disable newline-before-return */
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipNetworkId,
  type ChainNamespace,
  NumberUtil,
  ParseUtil
} from '@reown/appkit-common'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { type Exchange, formatCaip19Asset, getExchanges } from '../utils/ExchangeUtil.js'
import type { TransfersMethod, TransfersToken } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { ExchangeController } from './ExchangeController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import { SendController } from './SendController.js'
import { SnackController } from './SnackController.js'

const DEAD_ADDRESSES_BY_NAMESPACE: Partial<Record<ChainNamespace, string>> = {
  eip155: '0x000000000000000000000000000000000000dead',
  solana: 'CbKGgVKLJFb8bBrf58DnAkdryX6ubewVytn7X957YwNr',
  bip122: 'bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa'
}

const DEFAULT_EXCHANGES_PAGE = 0
export const MOCK_TOKENS = [
  // USDC tokens
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    caipNetworkId: 'eip155:8453'
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    caipNetworkId: 'eip155:10'
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png',
    caipNetworkId: 'eip155:1'
  },

  // USDT tokens
  {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png',
    caipNetworkId: 'eip155:1'
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    decimals: 6,
    logoUri: 'https://coin-images.coingecko.com/coins/images/39963/large/usdt.png',
    caipNetworkId: 'eip155:10'
  },

  // DAI tokens
  {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    logoUri: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
    caipNetworkId: 'eip155:1'
  },
  {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    decimals: 18,
    logoUri: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
    caipNetworkId: 'eip155:8453'
  },
  {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    decimals: 18,
    logoUri: 'https://coin-images.coingecko.com/coins/images/39807/large/dai.png',
    caipNetworkId: 'eip155:10'
  },

  // Native tokens
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8',
    decimals: 8,
    logoUri: 'https://assets.relay.link/icons/currencies/btc.png',
    caipNetworkId: 'bip122:000000000019d6689c085ae165831e93'
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    address: '11111111111111111111111111111111',
    decimals: 9,
    logoUri: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
  }
] as [TransfersToken, ...TransfersToken[]]

export interface TransferQuote {
  origin: {
    amount: string
    amountFormatted: string
    chainId: string
    symbol?: string
    decimals?: number
  }
  destination: {
    amount: string
    amountFormatted: string
    chainId: string
    symbol?: string
    decimals?: number
  }
  fees: Array<{
    label: string
    amount: string
    amountFormatted: string
    chainId: string
    amountUsd: string
    currency: TransfersToken
  }>
  requestId: string
  depositAddress: string
  timeEstimate: number
}

export interface TransferStatus {
  status: 'waiting' | 'pending' | 'success' | 'failure' | 'refund' | 'timeout' | 'submitted'
  requestId: string
  [key: string]: unknown
}

export interface TransfersControllerState {
  methods: TransfersMethod[]

  // Exchanges
  exchanges: Exchange[]
  exchangesLoading: boolean

  // Tokens
  sourceToken?: TransfersToken
  toToken?: TransfersToken
  sending: boolean
  polling: boolean

  // Amounts
  toTokenAmount: string

  // Recipient
  recipientAddress: string

  // Quote data
  quote?: TransferQuote
  quoteLoading: boolean
  quoteError?: string

  // Status data
  transferStatus?: TransferStatus
  statusLoading: boolean
  statusError?: string

  // Token lists
  myTokensWithBalance?: TransfersToken[]
  popularTokens?: TransfersToken[]
  suggestedTokens?: TransfersToken[]
  tokensLoading?: boolean
}

export interface SendTokenParameters {
  token: TransfersToken
  recipient: string
  amount: string
  namespace: ChainNamespace
}

export interface FetchExchangesParameters {
  asset: TransfersToken
  amount: string
}

type StateKey = keyof TransfersControllerState

export type AssetMetadata = {
  name: string
  symbol: string
  decimals: number
  logoUri?: string
}

export type PaymentAsset = {
  network: CaipNetworkId
  asset: string
  metadata: AssetMetadata
}

export type PaymentOptions = {
  paymentMethods?: TransfersMethod[]
  paymentAsset: PaymentAsset
  recipient: string
  amount: number
  openInNewTab?: boolean
  redirectUrl?: {
    success: string
    failure: string
  }
  payWithExchange?: {
    includeOnly?: string[]
    exclude?: string[]
  }
}

const initialState: TransfersControllerState = {
  methods: ['wallet'],
  sending: false,
  toTokenAmount: '',
  recipientAddress: '',
  quoteLoading: false,
  statusLoading: false,
  myTokensWithBalance: [],
  popularTokens: [],
  suggestedTokens: [],
  tokensLoading: false,
  polling: false,
  exchanges: [],
  exchangesLoading: false
}

const apiUrl = 'http://localhost:3000/api'

const state = proxy<TransfersControllerState>({ ...initialState })

const controller = {
  state,

  subscribe(callback: (newState: TransfersControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: TransfersControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setSourceToken(token: TransfersToken) {
    state.sourceToken = token
  },

  setToToken(token: TransfersToken) {
    state.toToken = token
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
  },

  setRecipientAddress(address: string) {
    state.recipientAddress = address
  },

  async fetchQuote(params: {
    user?: string
    sourceToken: TransfersToken
    toToken: TransfersToken
    recipient: string
    amount: string
  }) {
    state.quoteLoading = true
    state.quoteError = undefined
    state.quote = undefined

    try {
      const weiAmount = NumberUtil.bigNumber(params.amount)
        .times(10 ** params.toToken.decimals)
        .toString()

      const { chainId: originChainId, chainNamespace: originChainNamespace } =
        ParseUtil.parseCaipNetworkId(params.sourceToken.caipNetworkId)
      const { chainId: destinationChainId } = ParseUtil.parseCaipNetworkId(
        params.toToken.caipNetworkId
      )

      if (!params.user) {
        params.user = DEAD_ADDRESSES_BY_NAMESPACE[originChainNamespace]
      }

      const response = await fetch(`${apiUrl}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: params.user,
          originChainId: originChainId.toString(),
          originCurrency: params.sourceToken.address,
          destinationChainId: destinationChainId.toString(),
          destinationCurrency: params.toToken.address,
          recipient: params.recipient,
          amount: weiAmount
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch quote' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const quoteData: TransferQuote = await response.json()

      state.quote = quoteData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      state.quoteError = errorMessage
      console.error('Failed to fetch quote:', error)
      throw error
    } finally {
      state.quoteLoading = false
    }
  },

  async fetchStatus(requestId: string) {
    state.statusLoading = true
    state.statusError = undefined

    try {
      const url = `${apiUrl}/status?requestId=${encodeURIComponent(requestId)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch status' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const statusData: TransferStatus = await response.json()
      state.transferStatus = statusData

      return statusData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      state.statusError = errorMessage
      throw error
    } finally {
      state.statusLoading = false
    }
  },

  async sendToken({ namespace, token, recipient, amount }: SendTokenParameters) {
    try {
      state.sending = true
      switch (namespace) {
        case 'eip155': {
          await SendController.sendERC20Token({
            receiverAddress: recipient,
            tokenAddress: `${token.caipNetworkId}:${token.address}`,
            sendTokenAmount: Number(amount),
            decimals: token.decimals.toString()
          })
          break
        }

        case 'solana': {
          let tokenMint: string | undefined = undefined

          if (
            SendController.state.token &&
            SendController.state.token.address !== ConstantsUtil.SOLANA_NATIVE_TOKEN_ADDRESS
          ) {
            if (CoreHelperUtil.isCaipAddress(SendController.state.token.address)) {
              tokenMint = CoreHelperUtil.getPlainAddress(SendController.state.token.address)
            } else {
              tokenMint = SendController.state.token.address
            }
          }

          await ConnectionController.sendTransaction({
            chainNamespace: 'solana',
            tokenMint,
            to: recipient,
            value: Number(amount)
          })

          break
        }

        case 'bip122': {
          await ConnectionController.sendTransaction({
            chainNamespace: 'bip122',
            to: recipient,
            value: amount
          })
          break
        }

        default:
          throw new Error(`Unsupported chain: ${namespace}`)
      }
    } finally {
      state.sending = false
    }
  },

  async pollStatus(
    requestId: string,
    options: {
      expectedStatuses: TransferStatus['status'][]
      onStatusChange: (status: TransferStatus['status']) => void
      maxPollingAttempts?: number
      pollingInterval?: number
    }
  ) {
    try {
      state.polling = true

      const {
        expectedStatuses,
        onStatusChange,
        maxPollingAttempts = 20,
        pollingInterval = 2000
      } = options

      let attempts = 0

      async function checkStatus(): Promise<void> {
        if (attempts >= maxPollingAttempts) {
          console.warn('Max polling attempts reached, proceeding anyway')
          onStatusChange('timeout')
          return
        }

        attempts += 1

        try {
          const { status } = await TransfersController.fetchStatus(requestId)

          if (expectedStatuses.includes(status)) {
            onStatusChange(status)

            return
          }

          await new Promise(resolve => {
            setTimeout(resolve, pollingInterval)
          })

          return checkStatus()
        } catch (err) {
          console.error('Failed to fetch status:', err)
          await new Promise(resolve => {
            setTimeout(resolve, pollingInterval)
          })

          return checkStatus()
        }
      }

      await checkStatus()
    } finally {
      state.polling = false
    }
  },

  async fetchExchanges({ asset, amount }: FetchExchangesParameters) {
    try {
      state.exchangesLoading = true

      // eslint-disable-next-line no-warning-comments
      // TODO: Remove this once we have a proper way to enable pay with exchange
      if (OptionsController.state.remoteFeatures) {
        OptionsController.state.remoteFeatures.payWithExchange = true
      }

      const isPayWithExchangeSupported =
        OptionsController.state.remoteFeatures?.payWithExchange &&
        ChainController.state.activeCaipNetwork &&
        ConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(
          ChainController.state.activeCaipNetwork.chainNamespace
        )

      if (!isPayWithExchangeSupported) {
        state.exchanges = []
        state.exchangesLoading = false

        SnackController.showError('Pay with exchange is not enabled')

        return
      }

      const response = await getExchanges({
        page: DEFAULT_EXCHANGES_PAGE,
        asset: formatCaip19Asset(asset.caipNetworkId, asset.address),
        amount
      })
      // Putting this here in order to maintain backawrds compatibility with the UI when we introduce more exchanges
      state.exchanges = response.exchanges.slice(0, 2)
    } catch (error) {
      SnackController.showError('Unable to get exchanges')
      throw new Error('Unable to get exchanges')
    } finally {
      state.exchangesLoading = false
    }
  },

  async handlePayWithExchange({
    recipient,
    exchangeId,
    asset,
    amount
  }: {
    recipient: string
    exchangeId: string
    asset: TransfersToken
    amount: string
  }) {
    try {
      const popupWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'scrollbar=yes,width=480,height=720'
      )

      if (!popupWindow) {
        throw new Error('Could not create popup window')
      }

      const { url } = await ExchangeController.getPayUrl(exchangeId, {
        network: asset.caipNetworkId,
        asset: asset.address,
        amount,
        recipient
      })

      if (!url) {
        try {
          popupWindow.close()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Unable to close popup window', err)
        }

        throw new Error('Unable to initiate payment')
      }

      popupWindow.location.href = url

      return {
        popupWindow
      }
    } catch (err) {
      console.log('Unable to initiate payment', err)
      SnackController.showError('Unable to initiate payment')
      throw new Error('Unable to initiate payment')
    }
  },

  async handleTransfer(options: PaymentOptions) {
    state.toToken = {
      name: options.paymentAsset.metadata.name,
      symbol: options.paymentAsset.metadata.symbol,
      address: options.paymentAsset.asset,
      decimals: options.paymentAsset.metadata.decimals,
      caipNetworkId: options.paymentAsset.network,
      logoUri: options.paymentAsset.metadata.logoUri ?? ''
    }
    state.recipientAddress = options.recipient
    state.toTokenAmount = options.amount.toString()
    state.methods = options.paymentMethods ?? ['wallet', 'cex']

    await ModalController.open({
      view: 'Transfers'
    })
  },

  clearQuote() {
    state.quote = undefined
    state.quoteError = undefined
    state.toTokenAmount = ''
  },

  clearStatus() {
    state.transferStatus = undefined
    state.statusError = undefined
  },

  resetState() {
    Object.assign(state, initialState)
  }
}

export const TransfersController = withErrorBoundary(controller, 'API_ERROR')
