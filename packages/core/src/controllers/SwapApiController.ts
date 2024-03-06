import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from './NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'

const ONEINCH_API_BASE_URL = 'https://1inch-swap-proxy.walletconnect-v1-bridge.workers.dev'
const CURRENT_CHAIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const OneInchAPIEndpoints = {
  approveTransaction: (chainId: number) => `/swap/v5.2/${chainId}/approve/transaction`,
  approveAllowance: (chainId: number) => `/swap/v5.2/${chainId}/approve/allowance`,
  gasPrice: (chainId: number) => `/gas-price/v1.5/${chainId}`,
  swap: (chainId: number) => `/swap/v5.2/${chainId}/swap`,
  tokens: (chainId: number) => `/swap/v5.2/${chainId}/tokens`,
  tokensCustom: (chainId: number) => `/token/v1.2/${chainId}/custom`,
  tokensPrices: (chainId: number) => `/price/v1.1/${chainId}`,
  search: (chainId: number) => `/token/v1.2/${chainId}/search`,
  balance: (chainId: number, address: string | undefined) =>
    `/balance/v1.2/${chainId}/balances/${address}`
}

// -- Types --------------------------------------------- //
export interface SwapApiControllerState {
  initialLoading?: boolean
  isTransactionPending?: boolean
  sourceToken?: TokenInfo
  toToken?: TokenInfo
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
  popularTokens?: Record<string, TokenInfo>
  foundTokens?: TokenInfo[]
  myTokensWithBalance?: Record<string, TokenInfoWithBalance>
  tokensPriceMap: Record<string, string>
  swapErrorMessage?: string
  loadingPrices: boolean
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

export interface TokenInfoWithPrice extends TokenInfo {
  price: string
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
  hasAllowance: false,
  toTokenAmount: undefined,
  sourceTokenAmount: undefined,
  slippage: 1,
  disableEstimate: false,
  allowPartialFill: false,
  initialLoading: false,
  loading: false,
  tokens: undefined,
  popularTokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  tokensPriceMap: {},
  swapErrorMessage: undefined,
  isTransactionPending: false,
  loadingPrices: false,
  swapTransaction: undefined
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
    const api = new FetchUtil({ baseUrl: ONEINCH_API_BASE_URL })
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const { address } = AccountController.state

    return {
      api,
      paths: {
        approveTransaction: OneInchAPIEndpoints.approveTransaction(chainId),
        approveAllowance: OneInchAPIEndpoints.approveAllowance(chainId),
        gasPrice: OneInchAPIEndpoints.gasPrice(chainId),
        swap: OneInchAPIEndpoints.swap(chainId),
        tokens: OneInchAPIEndpoints.tokens(chainId),
        tokensCustom: OneInchAPIEndpoints.tokensCustom(chainId),
        tokenPrices: OneInchAPIEndpoints.tokensPrices(chainId),
        search: OneInchAPIEndpoints.search(chainId),
        balance: OneInchAPIEndpoints.balance(chainId, address)
      }
    }
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
    if (sourceToken?.address && !state.tokensPriceMap[sourceToken?.address]) {
      this.getTokenPriceWithAddresses([sourceToken?.address])
    }
  },

  setSourceTokenAmount(amount: string) {
    state.sourceTokenAmount = amount
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
  },

  setToToken(toToken?: TokenInfo) {
    state.toToken = toToken
    if (toToken?.address && !state.tokensPriceMap[toToken?.address]) {
      this.getTokenPriceWithAddresses([toToken.address])
    }
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

  formatNumberToLocalString(number: number) {
    return number.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
  },

  getPriceOfTokenAmount(amount: string | undefined, tokenAddress: `0x${string}` | undefined) {
    const tokenPrice = state.tokensPriceMap?.[tokenAddress || ''] || '0'
    const tokenPriceNumber = parseFloat(tokenPrice)
    const amountNumber = amount ? parseFloat(amount) : 0

    if (!tokenPriceNumber) {
      return 0
    }

    return this.formatNumberToLocalString(tokenPriceNumber * amountNumber)
  },

  async getGasPrice() {
    const { api, paths } = this._get1inchApi()

    const gasPrices = await api.get<Record<string, string>>({
      path: paths.gasPrice,
      headers: { 'content-type': 'application/json' }
    })

    return gasPrices
  },

  async getCurrentNetworkTokenPrice() {
    const { api, paths } = this._get1inchApi()
    const prices = await api.post<Record<string, string>>({
      path: paths.tokenPrices,
      body: { tokens: [CURRENT_CHAIN_ADDRESS], currency: 'USD' },
      headers: {
        'content-type': 'application/json'
      }
    })

    const priceString = prices?.[CURRENT_CHAIN_ADDRESS] || '0'
    const price = parseFloat(priceString)

    return price
  },

  async getSwapCalldata() {
    const { api, paths } = this._get1inchApi()
    const { fromAddress, slippage, sourceTokenAddress, sourceTokenAmount, toTokenAddress } =
      this._getSwapParams()

    console.log('>>> getSwapCalldata')
    if (!sourceTokenAmount || !state.sourceToken?.address || !state.toToken?.address) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swapTransactionRes = await api.get<any>({
      path: paths.swap,
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
    const { api, paths } = this._get1inchApi()
    const { sourceTokenAddress, sourceTokenAmount } = this._getSwapParams()

    if (!sourceTokenAmount || !state.sourceToken?.decimals) {
      return
    }

    const res = await api.get<SwapApprovalData>({
      path: paths.approveTransaction,
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
    const { api, paths } = this._get1inchApi()
    const { sourceTokenAddress, fromAddress, sourceTokenAmount } = this._getSwapParams()

    const res = await api.get<{ allowance: string }>({
      path: paths.approveAllowance,
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

    const { api, paths } = this._get1inchApi()
    await this.getMyTokensWithBalance({ forceRefetch: true })

    const res = await api.get<TokenList>({ path: paths.tokens })

    state.tokens = res.tokens
    state.popularTokens = Object.entries(res.tokens)
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
    const { api, paths } = this._get1inchApi()

    const res = await api.get<TokenInfo[]>({
      path: paths.search,
      params: { query: searchTerm }
    })

    state.foundTokens = res
  },

  async getMyTokensWithBalance(options?: { forceRefetch?: boolean }) {
    if (!options?.forceRefetch) {
      return state.myTokensWithBalance
    }

    state.initialLoading = true

    const { balances, tokenAddresses } = await this.getBalances()

    if (!tokenAddresses?.length) {
      state.initialLoading = false

      return undefined
    }

    const [tokens, tokensPrice] = await Promise.all([
      this.getTokenInfoWithAddresses(tokenAddresses),
      this.getTokenPriceWithAddresses(tokenAddresses)
    ])

    const mergedTokensWithBalances = await this.mergeTokenWithBalances(
      tokens,
      balances,
      tokensPrice
    )

    state.myTokensWithBalance = mergedTokensWithBalances

    state.initialLoading = false

    return mergedTokensWithBalances
  },

  async getBalances() {
    const { api, paths } = this._get1inchApi()

    const balances = await api.get<Record<string, string>>({
      path: paths.balance
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

    return { balances: nonEmptyBalances, tokenAddresses: Object.keys(nonEmptyBalances) }
  },

  async getTokenInfoWithAddresses(addresses: Array<string>) {
    const { api, paths } = this._get1inchApi()

    return api.get<Record<string, TokenInfo>>({
      path: paths.tokensCustom,
      params: { addresses: addresses.join(',') }
    })
  },

  async getTokenPriceWithAddresses(addresses: Array<string>) {
    state.loadingPrices = true

    const { api, paths } = this._get1inchApi()

    const prices = await api.post<Record<string, string>>({
      path: paths.tokenPrices,
      body: { tokens: addresses, currency: 'USD' },
      headers: {
        'content-type': 'application/json'
      }
    })

    Object.entries(prices).forEach(([tokenAddress, price]) => {
      state.tokensPriceMap[tokenAddress] = price
    })

    state.loadingPrices = false

    return prices
  },

  async mergeTokenWithBalances(
    tokens: Record<string, TokenInfo>,
    balances: Record<string, string>,
    tokensPrice: Record<string, string>
  ) {
    return Object.entries(tokens).reduce<Record<string, TokenInfoWithBalance>>(
      (mergedTokens, [tokenAddress, tokenInfo], i) => {
        mergedTokens[tokenAddress] = {
          ...tokenInfo,
          balance: balances[tokenAddress] ?? '0',
          price: tokensPrice[tokenAddress] ?? '0'
        }
        if (i === 0) {
          this.setSourceToken(tokenInfo)
        }

        return mergedTokens
      },
      {}
    )
  },

  async getTokenSwapInfo() {
    try {
      if (state.sourceToken?.address && state.toToken?.address) {
        state.loading = true
        const hasAllowance = await SwapApiController.getTokenAllowance()
        console.log('>>> hasAllowance', hasAllowance)

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
