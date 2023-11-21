import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from './NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from './AccountController.js'

// -- Types --------------------------------------------- //
export interface SwapApiControllerState {
  sourceTokenAddress?: `0x${string}`
  toTokenAddress?: `0x${string}`
  sourceTokenAmount?: string
  slippage?: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  loading?: boolean
}

type StateKey = keyof SwapApiControllerState

// -- State --------------------------------------------- //
const state = proxy<SwapApiControllerState>({
  sourceTokenAddress: undefined,
  toTokenAddress: undefined,
  sourceTokenAmount: undefined,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
  loading: false
})

// -- Controller ---------------------------------------- //
export const SwapApiController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapApiControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  _getApi() {
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const baseUrl = CoreHelperUtil.get1inchApiUrl(chainId)

    return new FetchUtil({ baseUrl })
  },

  _getSwapParams() {
    const { address } = AccountController.state
    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    return {
      fromAddress: address,
      sourceTokenAddress: state.sourceTokenAddress,
      toTokenAddress: state.toTokenAddress,
      sourceTokenAmount: state.sourceTokenAmount,
      slippage: state.slippage
    }
  },

  setSourceTokenAddress(sourceTokenAddress: `0x${string}`) {
    state.sourceTokenAddress = sourceTokenAddress
  },

  setSourceTokenAmount(swapFromAmount: string) {
    state.sourceTokenAmount = swapFromAmount
  },

  setToTokenAddress(toTokenAddress: `0x${string}`) {
    state.toTokenAddress = toTokenAddress
  },

  setSlippage(slippage: number) {
    state.slippage = slippage
  },

  setLoading(isLoading: boolean) {
    state.loading = isLoading
  },

  async swap(isFusion?: boolean) {
    const api = this._getApi()
    const path = `${api.baseUrl}/${isFusion ? 'fusion' : 'swap'}`
    const body = this._getSwapParams()

    const swapTransactionRes = await api.post({
      path,
      body
    })

    return swapTransactionRes
  },

  async hasTokenAllowance() {
    const api = this._getApi()
    const path = `${api.baseUrl}/approve/allowance`
    const { sourceTokenAddress, fromAddress, sourceTokenAmount } = this._getSwapParams()

    const res = await api.post<{ allowance: string }>({
      path,
      body: { sourceTokenAddress, fromAddress }
    })

    if (res?.allowance && sourceTokenAmount) {
      return BigInt(res.allowance) >= BigInt(sourceTokenAmount)
    }

    return false
  }
}
