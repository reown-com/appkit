import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from './NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from './AccountController.js'

// -- Types --------------------------------------------- //
export interface SwapApiControllerState {
  sourceToken?: TokenInfo
  toToken?: TokenInfo
  sourceTokenAmount?: string
  slippage?: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  loading?: boolean
  tokens?: Record<string, TokenInfo>
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

interface ApproveCallDataResponse {
  data: string
  gasPrice: string
  to: string
  value: string
}

interface TokenList {
  tokens: Record<string, TokenInfo>
}

type StateKey = keyof SwapApiControllerState

// -- State --------------------------------------------- //
const state = proxy<SwapApiControllerState>({
  sourceToken: undefined,
  toToken: undefined,
  sourceTokenAmount: undefined,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
  loading: false,
  tokens: undefined
})

// -- Controller ---------------------------------------- //
export const SwapApiController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _get1inchApi() {
    const baseUrl = 'http://localhost:8787'

    return new FetchUtil({ baseUrl })
  },

  _getSwapParams() {
    const { address } = AccountController.state
    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    return {
      fromAddress: address,
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
    state.sourceToken = newSourceToken
    state.toToken = newToToken

    return { newToToken, newSourceToken }
  },

  async getSwapCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)

    const path = `${api.baseUrl}/${chainId}/swap`
    const params = this._getSwapParams()

    const swapTransactionRes = await api.get({
      path,
      params
    })

    return swapTransactionRes
  },

  async getSwapApprovalCalldata() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/${chainId}/approve/transaction`
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

  async getTokenList() {
    if (!state.tokens) {
      const api = this._get1inchApi()
      const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
      const path = `${api.baseUrl}/${chainId}/tokens`

      const res = await api.get<TokenList>({
        path
      })

      state.tokens = res.tokens
    }

    return state.tokens
  },

  async getTokenAllowance() {
    const api = this._get1inchApi()
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const path = `${api.baseUrl}/${chainId}/approve/allowance`
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
  }
}
