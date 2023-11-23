import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from './NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'

// -- Types --------------------------------------------- //
export interface SwapApiControllerState {
  sourceToken?: TokenInfo
  toToken?: TokenInfo
  toTokenAmount?: string
  swapTransaction?: TransactionData
  sourceTokenAmount?: string
  slippage?: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  loading?: boolean
  tokens?: Record<string, TokenInfo>
  foundTokens?: TokenInfo[]
  myTokensWithBalance?: Record<string, TokenInfoWithBalance>
  swapErrorMessage?: string
}

export interface TokenInfo {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoURI: string
  domainVersion?: string
  eip2612?: boolean
  isFoT?: boolean
  tags?: string[]
}

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string
}

interface TransactionData {
  from: string
  to: `0x${string}`
  data: `0x${string}`
  value: string
  gas: number
  gasPrice: string
}

interface SwapResponse {
  toAmount: string
  tx: TransactionData
}

interface ApproveCallDataResponse {
  data: string
  gasPrice: string
  to: string
  value: string
}

interface TokenList {
  tokens: Record<string, TokenInfo>
}

interface SwapRequestError {
  error: string
  description: string
  statusCode: 400 | 500
  requestId: string
  meta: HttpExceptionMeta[]
}

interface HttpExceptionMeta {
  type: string
  value: string
}

type StateKey = keyof SwapApiControllerState

// -- State --------------------------------------------- //
const state = proxy<SwapApiControllerState>({
  sourceToken: undefined,
  toToken: undefined,
  toTokenAmount: undefined,
  sourceTokenAmount: undefined,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
  loading: false,
  tokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  swapErrorMessage: undefined
})

// -- Controller ---------------------------------------- //
export const SwapApiController = {
  state,

  subscribe(callback: (newState: SwapApiControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _get1inchApi() {
    const baseUrl = 'https://1inch-swap-proxy.walletconnect-v1-bridge.workers.dev'

    return new FetchUtil({ baseUrl })
  },

  _getSwapParams() {
    const { address } = AccountController.state
    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    return {
      fromAddress: address as `0x${string}`,
      sourceTokenAddress: state.sourceToken?.address,
      toTokenAddress: state.toToken?.address,
      sourceTokenAmount: state.sourceTokenAmount,
      slippage: state.slippage?.toString()
    }
  },

  setSourceToken(sourceToken: TokenInfo) {
    state.sourceToken = sourceToken
  },

  setSourceTokenAmount(swapFromAmount: string) {
    state.sourceTokenAmount = swapFromAmount
  },

  setToToken(toToken: TokenInfo) {
    state.toToken = toToken
  },

  setSlippage(slippage: number) {
    state.slippage = slippage
  },

  setLoading(isLoading: boolean) {
    state.loading = isLoading
  },

  switchTokens() {
    const newToToken = state.sourceToken
    const newSourceToken = state.toToken
    const newToTokenAmount = state.sourceTokenAmount
    const newSourceTokenAmount = state.toTokenAmount
    state.sourceToken = newSourceToken
    state.toToken = newToToken
    state.sourceTokenAmount = newToTokenAmount
    state.toTokenAmount = newSourceTokenAmount
  },

  clearFoundTokens() {
    state.foundTokens = undefined
  },

  async getSwapCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const path = `${api.baseUrl}/swap/v5.2/${chainId}/swap`
    const { fromAddress, slippage, sourceTokenAddress, sourceTokenAmount, toTokenAddress } =
      this._getSwapParams()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swapTransactionRes = await api.get<any>({
      path,
      params: {
        src: sourceTokenAddress,
        dst: toTokenAddress,
        slippage,
        from: fromAddress,
        amount: sourceTokenAmount
      }
    })

    if (swapTransactionRes.error) {
      state.toTokenAmount = undefined
      state.swapTransaction = undefined

      const swapTransaction: SwapRequestError = swapTransactionRes
      state.swapErrorMessage = swapTransaction.description
    } else {
      state.swapErrorMessage = undefined

      const swapTransaction: SwapResponse = swapTransactionRes
      state.toTokenAmount = swapTransaction.toAmount
      state.swapTransaction = swapTransaction.tx
    }
  },

  async getSwapApprovalCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/swap/v5.2/${chainId}/approve/transaction`
    const { sourceTokenAddress, sourceTokenAmount } = this._getSwapParams()

    const res = await api.get<ApproveCallDataResponse>({
      path,
      params: {
        tokenAddress: sourceTokenAddress,
        amount: sourceTokenAmount
      }
    })

    return res
  },

  async getTokenAllowance() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/swap/v5.2/${chainId}/approve/allowance`
    const { sourceTokenAddress, fromAddress, sourceTokenAmount } = this._getSwapParams()

    const res = await api.get<{ allowance: string }>({
      path,
      params: { tokenAddress: sourceTokenAddress, walletAddress: fromAddress }
    })

    if (res?.allowance && sourceTokenAmount) {
      return {
        hasEnoughAllowance: BigInt(res.allowance) >= BigInt(sourceTokenAmount),
        allowance: res?.allowance
      }
    }

    return { hasEnoughAllowance: false, allowance: '0' }
  },

  async getTokenList() {
    if (state.tokens) {
      return state.tokens
    }
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/swap/v5.2/${chainId}/tokens`

    const res = await api.get<TokenList>({
      path
    })

    state.tokens = Object.entries(res.tokens)
      .sort(([, aTokenInfo], [, bTokenInfo]) => {
        if (aTokenInfo.symbol < bTokenInfo.symbol) {
          return -1
        }
        if (aTokenInfo.symbol > bTokenInfo.symbol) {
          return 1
        }

        return 0
      })
      .reduce<Record<string, TokenInfo>>((limitedTokens, [tokenAddress, tokenInfo]) => {
        if (ConstantsUtil.POPULAR_TOKENS.includes(tokenInfo.symbol)) {
          limitedTokens[tokenAddress] = tokenInfo
          if (tokenInfo.symbol === 'ETH') {
            state.sourceToken = tokenInfo
          }
        }

        return limitedTokens
      }, {})

    return state.tokens
  },

  async searchTokens(searchTerm: string) {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/token/v1.2/${chainId}/search`

    const res = await api.get<TokenInfo[]>({
      path,
      params: {
        query: searchTerm
      }
    })

    state.foundTokens = res
  },

  async getMyTokensWithBalance() {
    if (state.myTokensWithBalance) {
      return state.myTokensWithBalance
    }

    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const { fromAddress } = this._getSwapParams()
    const balancesPath = `${api.baseUrl}/balance/v1.2/${chainId}/balances/${fromAddress}`

    const balances = await api.get<Record<string, string>>({
      path: balancesPath
    })

    const nonEmptyBalances = Object.entries(balances).reduce<Record<string, string>>(
      (filteredBalances, [tokenAddress, balance]) => {
        if (balance !== '0') {
          filteredBalances[tokenAddress] = balance
        }

        return filteredBalances
      },
      {}
    )

    const tokensPath = `${api.baseUrl}/token/v1.2/${chainId}/custom`
    const tokens = await api.get<Record<string, TokenInfo>>({
      path: tokensPath,
      params: {
        addresses: Object.keys(nonEmptyBalances).join(',')
      }
    })

    const mergedTokensWithBalances = Object.entries(tokens).reduce<
      Record<string, TokenInfoWithBalance>
    >((mergedTokens, [tokenAddress, tokenInfo]) => {
      mergedTokens[tokenAddress] = {
        ...tokenInfo,
        balance: balances[tokenAddress] ?? '0'
      }

      return mergedTokens
    }, {})

    state.myTokensWithBalance = mergedTokensWithBalances

    return mergedTokensWithBalances
  },

  async swapTokens() {
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const { fromAddress } = this._getSwapParams()

    if (state.swapTransaction) {
      try {
        const tx = await ConnectionController.sendTransaction({
          address: fromAddress,
          chainId,
          data: state.swapTransaction.data,
          to: state.swapTransaction.to,
          gas: BigInt(state.swapTransaction.gas),
          gasPrice: BigInt(state.swapTransaction.gasPrice),
          value: BigInt(state.swapTransaction.value)
        })
        console.log({ tx })
      } catch (error: unknown) {
        console.error({ swapTxError: error })
        if (error instanceof Error) {
          state.swapErrorMessage = error.message
        }
      }
    }
  }
}
