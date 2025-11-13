import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type ChainNamespace, NumberUtil, ParseUtil } from '@reown/appkit-common'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import type { TransfersToken } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ConnectionController } from './ConnectionController.js'
import { SendController } from './SendController.js'

const DEAD_ADDRESSES_BY_NAMESPACE: Partial<Record<ChainNamespace, string>> = {
  eip155: '0x000000000000000000000000000000000000dead',
  solana: 'CbKGgVKLJFb8bBrf58DnAkdryX6ubewVytn7X957YwNr',
  bip122: 'bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa'
}

const RECIPIENT_ADDRESS = '0x8B271bedbf142EaB0819B113D9003Ee22BeE3871'

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
  status: 'waiting' | 'pending' | 'success' | 'failure' | 'refund' | 'timeout'
  requestId: string
  [key: string]: unknown
}

export interface TransfersControllerState {
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

type StateKey = keyof TransfersControllerState

const initialState: TransfersControllerState = {
  sending: false,
  toTokenAmount: '0.1',
  toToken: MOCK_TOKENS[0],
  recipientAddress: RECIPIENT_ADDRESS,
  quoteLoading: false,
  statusLoading: false,
  myTokensWithBalance: [],
  popularTokens: [],
  suggestedTokens: [],
  tokensLoading: false,
  polling: false
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

      console.log('params', params)

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
      expectedStatus: string
      onStatusChange: (status: TransferStatus['status']) => void
      maxPollingAttempts?: number
      pollingInterval?: number
    }
  ) {
    try {
      state.polling = true

      const {
        expectedStatus,
        onStatusChange,
        maxPollingAttempts = 60,
        pollingInterval = 2000
      } = options

      let attempts = 0

      const checkStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          console.warn('Max polling attempts reached, proceeding anyway')
          onStatusChange('timeout')
          return
        }

        attempts++

        try {
          const { status } = await TransfersController.fetchStatus(requestId)

          if (!status) {
            await new Promise(resolve => setTimeout(resolve, pollingInterval))
            return checkStatus()
          }

          if (status === expectedStatus) {
            onStatusChange(status)
            return
          }

          await new Promise(resolve => setTimeout(resolve, pollingInterval))
          return checkStatus()
        } catch (err) {
          console.error('Failed to fetch status:', err)
          await new Promise(resolve => setTimeout(resolve, pollingInterval))
          return checkStatus()
        }
      }

      await checkStatus()
    } finally {
      state.polling = false
    }
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
