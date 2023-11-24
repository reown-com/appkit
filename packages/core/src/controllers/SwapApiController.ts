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
  initialLoading?: boolean
  isTransactionPending?: boolean
  sourceToken?: TokenInfo
  sourceTokenAddress?: `0x${string}`
  toToken?: TokenInfo
  toTokenAddress?: `0x${string}`
  toTokenAmount?: string
  swapTransaction?: TransactionData
  swapApproval?: SwapApprovalData
  sourceTokenAmount?: string
  slippage?: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  hasAllowance: boolean
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
  price: string
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

interface SwapApprovalData {
  data: `0x${string}`
  to: `0x${string}`
  gasPrice: string
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
  sourceTokenAddress: undefined,
  toToken: undefined,
  toTokenAddress: undefined,
  hasAllowance: false,
  toTokenAmount: undefined,
  sourceTokenAmount: undefined,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
  initialLoading: false,
  loading: false,
  tokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  swapErrorMessage: undefined,
  isTransactionPending: false
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

  setSourceToken(sourceToken?: TokenInfo) {
    state.sourceToken = sourceToken
    state.sourceTokenAddress = sourceToken?.address
  },

  setSourceTokenAmount(swapFromAmount: string) {
    state.sourceTokenAmount = swapFromAmount
  },

  setToToken(toToken?: TokenInfo) {
    state.toToken = toToken
    state.toTokenAddress = toToken?.address
  },

  setSlippage(slippage: number) {
    state.slippage = slippage
  },

  setLoading(isLoading: boolean) {
    state.loading = isLoading
  },

  switchTokens() {
    const newSourceToken = state.toToken
    const newToToken = state.sourceToken
    this.setSourceToken(newSourceToken)
    this.setToToken(newToToken)

    state.sourceTokenAmount = ''
    state.toTokenAmount = ''
  },

  clearFoundTokens() {
    state.foundTokens = undefined
  },

  clearTokens() {
    state.tokens = undefined
  },

  clearMyTokens() {
    state.myTokensWithBalance = undefined
  },

  clearError() {
    state.swapErrorMessage = undefined
  },

  async getSwapCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const path = `${api.baseUrl}/swap/v5.2/${chainId}/swap`
    const { fromAddress, slippage, sourceTokenAddress, sourceTokenAmount, toTokenAddress } =
      this._getSwapParams()

    if (!sourceTokenAmount || !state.sourceToken?.address || !state.toToken?.address) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swapTransactionRes = await api.get<any>({
      path,
      params: {
        src: sourceTokenAddress,
        dst: toTokenAddress,
        slippage,
        from: fromAddress,
        amount: ConnectionController.parseUnits(
          sourceTokenAmount,
          state.sourceToken?.decimals
        ).toString()
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
      state.swapTransaction = swapTransaction.tx
      state.toTokenAmount = ConnectionController.formatUnits(
        BigInt(swapTransaction.toAmount),
        state.toToken.decimals
      )
    }
  },

  async getSwapApprovalCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/swap/v5.2/${chainId}/approve/transaction`
    const { sourceTokenAddress, sourceTokenAmount } = this._getSwapParams()

    if (!sourceTokenAmount || !state.sourceToken?.decimals) {
      return
    }
    const res = await api.get<SwapApprovalData>({
      path,
      params: {
        tokenAddress: sourceTokenAddress,
        amount: ConnectionController.parseUnits(
          sourceTokenAmount,
          state.sourceToken.decimals
        ).toString()
      }
    })

    state.swapApproval = res
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

    if (res?.allowance && sourceTokenAmount && state.sourceToken?.decimals) {
      const hasAllowance =
        BigInt(res.allowance) >=
        ConnectionController.parseUnits(sourceTokenAmount, state.sourceToken?.decimals)
      state.hasAllowance = hasAllowance

      return hasAllowance
    }

    state.hasAllowance = false

    return false
  },

  async getTokenList(options?: { forceRefetch?: boolean }) {
    if (state.tokens && !options?.forceRefetch) {
      return state.tokens
    }
    state.initialLoading = true
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
        }

        return limitedTokens
      }, {})

    state.initialLoading = false

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

  async getMyTokensWithBalance(options?: { forceRefetch?: boolean }) {
    if (state.initialLoading) {
      return state.myTokensWithBalance
    }

    if (state.myTokensWithBalance && !options?.forceRefetch) {
      return state.myTokensWithBalance
    }

    state.initialLoading = true

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

    const tokenAddresses = Object.keys(nonEmptyBalances)

    if (!tokenAddresses?.length) {
      state.initialLoading = false

      return undefined
    }

    const tokensPath = `${api.baseUrl}/token/v1.2/${chainId}/custom`
    const tokensSpotPricePath = `${api.baseUrl}/price/v1.1/${chainId}`

    const [tokens, tokensPrice] = await Promise.all([
      api.get<Record<string, TokenInfo>>({
        path: tokensPath,
        params: {
          addresses: tokenAddresses.join(',')
        }
      }),
      api.post<Record<string, string>>({
        path: tokensSpotPricePath,
        body: {
          tokens: tokenAddresses,
          currency: 'USD'
        },
        headers: {
          'content-type': 'application/json'
        }
      })
    ])

    const mergedTokensWithBalances = Object.entries(tokens).reduce<
      Record<string, TokenInfoWithBalance>
    >((mergedTokens, [tokenAddress, tokenInfo], i) => {
      mergedTokens[tokenAddress] = {
        ...tokenInfo,
        balance: balances[tokenAddress] ?? '0',
        price: tokensPrice[tokenAddress] ?? '0'
      }
      if (i === 0) {
        this.setSourceToken(tokenInfo)
      }

      return mergedTokens
    }, {})

    state.myTokensWithBalance = mergedTokensWithBalances

    state.initialLoading = false

    return mergedTokensWithBalances
  },

  async getTokenSwapInfo() {
    try {
      if (state.sourceToken?.address && state.toToken?.address) {
        state.loading = true
        const hasAllowance = await SwapApiController.getTokenAllowance()

        if (hasAllowance) {
          await SwapApiController.getSwapCalldata()
        } else {
          await SwapApiController.getSwapApprovalCalldata()
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        state.swapErrorMessage = error.message
      }
    } finally {
      state.loading = false
    }
  },

  async swapTokens() {
    state.isTransactionPending = true
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const { fromAddress } = this._getSwapParams()

    if (state.swapTransaction) {
      try {
        await ConnectionController.sendTransaction({
          address: fromAddress,
          chainId,
          data: state.swapTransaction.data,
          to: state.swapTransaction.to,
          gas: BigInt(state.swapTransaction.gas),
          gasPrice: BigInt(state.swapTransaction.gasPrice),
          value: BigInt(state.swapTransaction.value)
        })

        await this.getMyTokensWithBalance({ forceRefetch: true })
      } catch (error: unknown) {
        if (error instanceof Error) {
          state.swapErrorMessage = error.message
        }
      } finally {
        state.isTransactionPending = false
      }
    }
  },

  async approveSwapTokens() {
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const { fromAddress } = this._getSwapParams()

    if (state.swapApproval) {
      const { data, to, gasPrice, value } = state.swapApproval

      try {
        await ConnectionController.sendTransaction({
          address: fromAddress,
          chainId,
          data,
          to,
          gasPrice: BigInt(gasPrice),
          value: BigInt(value)
        })
        state.hasAllowance = true
      } catch (error: unknown) {
        if (error instanceof Error) {
          state.swapErrorMessage = error.message
        }
      }
    }
  }
}
