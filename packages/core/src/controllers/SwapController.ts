import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import { SnackController } from './SnackController.js'
import { RouterController } from './RouterController.js'
import { NumberUtil } from '@web3modal/common'
import { erc20ABI } from '@web3modal/common'
import type { SwapTokenWithBalance } from '../utils/TypeUtil.js'
import { NetworkController } from './NetworkController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'
import { SwapCalculationUtil } from '../utils/SwapCalculationUtil.js'

// -- Constants ---------------------------------------- //
export const INITIAL_GAS_LIMIT = 150000

// -- Types --------------------------------------------- //
export type SwapInputTarget = 'sourceToken' | 'toToken'

type TransactionParams = {
  data: string
  to: string
  gas: bigint
  gasPrice: bigint
  value: bigint
  toAmount: string
}

class TransactionError extends Error {
  shortMessage?: string

  constructor(message?: string, shortMessage?: string) {
    super(message)
    this.name = 'TransactionError'
    this.shortMessage = shortMessage
  }
}

export interface SwapControllerState {
  // Loading states
  initializing: boolean
  initialized: boolean
  loadingPrices: boolean
  loading?: boolean

  // Error states
  fetchError: boolean

  // Approval & Swap transaction states
  approvalTransaction: TransactionParams | undefined
  swapTransaction: TransactionParams | undefined
  transactionLoading?: boolean
  transactionError?: string

  // Input values
  sourceToken?: SwapTokenWithBalance
  sourceTokenAmount: string
  sourceTokenPriceInUSD: number
  toToken?: SwapTokenWithBalance
  toTokenAmount: string
  toTokenPriceInUSD: number
  networkPrice: string
  networkBalanceInUSD: string
  networkTokenSymbol: string
  inputError: string | undefined

  // Request values
  slippage: number

  // Tokens
  tokens?: SwapTokenWithBalance[]
  suggestedTokens?: SwapTokenWithBalance[]
  popularTokens?: SwapTokenWithBalance[]
  foundTokens?: SwapTokenWithBalance[]
  myTokensWithBalance?: SwapTokenWithBalance[]
  tokensPriceMap: Record<string, number>

  // Calculations
  gasFee: bigint
  gasPriceInUSD?: number
  priceImpact: number | undefined
  maxSlippage: number | undefined
  providerFee: string | undefined
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

type StateKey = keyof SwapControllerState

// -- State --------------------------------------------- //
const initialState: SwapControllerState = {
  // Loading states
  initializing: false,
  initialized: false,
  loading: false,
  loadingPrices: false,

  // Error states
  fetchError: false,

  // Approval & Swap transaction states
  approvalTransaction: undefined,
  swapTransaction: undefined,
  transactionError: undefined,
  transactionLoading: false,

  // Input values
  sourceToken: undefined,
  sourceTokenAmount: '',
  sourceTokenPriceInUSD: 0,
  toToken: undefined,
  toTokenAmount: '',
  toTokenPriceInUSD: 0,
  networkPrice: '0',
  networkBalanceInUSD: '0',
  networkTokenSymbol: '',
  inputError: undefined,

  // Request values
  slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,

  // Tokens
  tokens: undefined,
  popularTokens: undefined,
  suggestedTokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  tokensPriceMap: {},

  // Calculations
  gasFee: BigInt(0),
  gasPriceInUSD: 0,
  priceImpact: undefined,
  maxSlippage: undefined,
  providerFee: undefined
}

const state = proxy<SwapControllerState>(initialState)

// -- Controller ---------------------------------------- //
export const SwapController = {
  state,

  subscribe(callback: (newState: SwapControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  getParams() {
    const { address } = AccountController.state
    const networkAddress = `${NetworkController.state.caipNetwork?.id}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS}`

    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    const caipAddress = AccountController.state.caipAddress
    const invalidToToken = !state.toToken?.address || !state.toToken?.decimals
    const invalidSourceToken =
      !state.sourceToken?.address ||
      !state.sourceToken?.decimals ||
      !NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0)
    const invalidSourceTokenAmount = !state.sourceTokenAmount

    return {
      networkAddress,
      fromAddress: address,
      fromCaipAddress: AccountController.state.caipAddress,
      sourceTokenAddress: state.sourceToken?.address,
      toTokenAddress: state.toToken?.address,
      toTokenAmount: state.toTokenAmount,
      toTokenDecimals: state.toToken?.decimals,
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenDecimals: state.sourceToken?.decimals,
      invalidToToken,
      invalidSourceToken,
      invalidSourceTokenAmount,
      availableToSwap:
        caipAddress && !invalidToToken && !invalidSourceToken && !invalidSourceTokenAmount
    }
  },

  setLoading(loading: boolean) {
    state.loading = loading
  },

  setSourceToken(sourceToken: SwapTokenWithBalance | undefined) {
    if (!sourceToken) {
      state.sourceToken = sourceToken
      state.sourceTokenAmount = ''
      state.sourceTokenPriceInUSD = 0

      return
    }

    state.sourceToken = sourceToken
    this.setTokenPrice(sourceToken.address, 'sourceToken')
  },

  setSourceTokenAmount(amount: string) {
    state.sourceTokenAmount = amount
  },

  setToToken(toToken: SwapTokenWithBalance | undefined) {
    if (!toToken) {
      state.toToken = toToken
      state.toTokenAmount = ''
      state.toTokenPriceInUSD = 0

      return
    }

    state.toToken = toToken
    this.setTokenPrice(toToken.address, 'toToken')
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
  },

  async setTokenPrice(address: string, target: SwapInputTarget) {
    const { availableToSwap } = this.getParams()
    let price = state.tokensPriceMap[address] || 0

    if (!price) {
      state.loadingPrices = true
      price = await this.getAddressPrice(address)
    }

    if (target === 'sourceToken') {
      state.sourceTokenPriceInUSD = price
    } else if (target === 'toToken') {
      state.toTokenPriceInUSD = price
    }

    if (state.loadingPrices) {
      state.loadingPrices = false
      if (availableToSwap) {
        this.swapTokens()
      }
    }
  },

  switchTokens() {
    if (state.initializing || !state.initialized) {
      return
    }

    const newSourceToken = state.toToken ? { ...state.toToken } : undefined
    const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined
    const newSourceTokenAmount =
      newSourceToken && state.toTokenAmount === '' ? '1' : state.toTokenAmount

    this.setSourceToken(newSourceToken)
    this.setToToken(newToToken)

    this.setSourceTokenAmount(newSourceTokenAmount)
    this.setToTokenAmount('')
    this.swapTokens()
  },

  resetState() {
    state.myTokensWithBalance = initialState.myTokensWithBalance
    state.tokensPriceMap = initialState.tokensPriceMap
    state.initialized = initialState.initialized
    state.sourceToken = initialState.sourceToken
    state.sourceTokenAmount = initialState.sourceTokenAmount
    state.sourceTokenPriceInUSD = initialState.sourceTokenPriceInUSD
    state.toToken = initialState.toToken
    state.toTokenAmount = initialState.toTokenAmount
    state.toTokenPriceInUSD = initialState.toTokenPriceInUSD
    state.networkPrice = initialState.networkPrice
    state.networkTokenSymbol = initialState.networkTokenSymbol
    state.networkBalanceInUSD = initialState.networkBalanceInUSD
    state.inputError = initialState.inputError
  },

  resetValues() {
    const { networkAddress } = this.getParams()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)
    this.setSourceToken(networkToken)
    this.setToToken(undefined)
  },

  clearError() {
    state.transactionError = undefined
  },

  async initializeState() {
    if (state.initializing) {
      return
    }

    state.initializing = true
    if (!state.initialized) {
      try {
        await this.fetchTokens()
        state.initialized = true
      } catch (error) {
        state.initialized = false
        SnackController.showError('Failed to initialize swap')
        RouterController.goBack()
      }
    }
    state.initializing = false
  },

  async fetchTokens() {
    const { networkAddress } = this.getParams()

    await this.getTokenList()
    await this.getNetworkTokenPrice()
    await this.getMyTokensWithBalance()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)

    if (networkToken) {
      state.networkTokenSymbol = networkToken.symbol
      this.setSourceToken(networkToken)
      this.setSourceTokenAmount('1')
    }
  },

  async getTokenList() {
    const tokens = await SwapApiUtil.getTokenList()

    state.tokens = tokens
    state.popularTokens = tokens
      .sort((aTokenInfo, bTokenInfo) => {
        if (aTokenInfo.symbol < bTokenInfo.symbol) {
          return -1
        }
        if (aTokenInfo.symbol > bTokenInfo.symbol) {
          return 1
        }

        return 0
      })
      .filter(token => {
        if (ConstantsUtil.SWAP_POPULAR_TOKENS.includes(token.symbol)) {
          return true
        }

        return false
      }, {})
    state.suggestedTokens = tokens.filter(token => {
      if (ConstantsUtil.SWAP_SUGGESTED_TOKENS.includes(token.symbol)) {
        return true
      }

      return false
    }, {})
  },

  async getAddressPrice(address: string) {
    const existPrice = state.tokensPriceMap[address]

    if (existPrice) {
      return existPrice
    }

    const response = await BlockchainApiController.fetchTokenPrice({
      projectId: OptionsController.state.projectId,
      addresses: [address]
    })
    const fungibles = response.fungibles || []
    const allTokens = [...(state.tokens || []), ...(state.myTokensWithBalance || [])]
    const symbol = allTokens?.find(token => token.address === address)?.symbol
    const price =
      fungibles.find(p => p.symbol.toLowerCase() === symbol?.toLowerCase())?.price || '0'
    const priceAsFloat = parseFloat(price)

    state.tokensPriceMap[address] = priceAsFloat

    return priceAsFloat
  },

  async getNetworkTokenPrice() {
    const { networkAddress } = this.getParams()

    const response = await BlockchainApiController.fetchTokenPrice({
      projectId: OptionsController.state.projectId,
      addresses: [networkAddress]
    })
    const token = response.fungibles?.[0]
    const price = token?.price || '0'
    state.tokensPriceMap[networkAddress] = parseFloat(price)
    state.networkTokenSymbol = token?.symbol || ''
    state.networkPrice = price
  },

  async getMyTokensWithBalance() {
    const balances = await SwapApiUtil.getMyTokensWithBalance()

    if (!balances) {
      return
    }

    await this.getInitialGasPrice()
    this.setBalances(balances)
  },

  setBalances(balances: SwapTokenWithBalance[]) {
    const { networkAddress } = this.getParams()
    const caipNetwork = NetworkController.state.caipNetwork

    if (!caipNetwork) {
      return
    }

    const networkToken = balances.find(token => token.address === networkAddress)

    balances.forEach(token => {
      state.tokensPriceMap[token.address] = token.price || 0
    })
    state.myTokensWithBalance = balances.filter(token => token.address.startsWith(caipNetwork.id))
    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
      : '0'
  },

  async getInitialGasPrice() {
    const res = await SwapApiUtil.fetchGasPrice()

    if (!res) {
      return { gasPrice: null, gasPriceInUsd: null }
    }

    const value = res.standard
    const gasFee = BigInt(value)
    const gasLimit = BigInt(INITIAL_GAS_LIMIT)
    const gasPrice = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gasLimit, gasFee)

    state.gasPriceInUSD = gasPrice

    return { gasPrice: gasFee, gasPriceInUSD: state.gasPriceInUSD }
  },

  // -- Swap -------------------------------------- //
  async swapTokens() {
    const sourceToken = state.sourceToken
    const toToken = state.toToken
    const haveSourceTokenAmount = NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0)

    if (!toToken || !sourceToken || state.loadingPrices || !haveSourceTokenAmount) {
      return
    }

    state.loading = true
    state.toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken: state.sourceToken,
      toToken: state.toToken,
      sourceTokenPrice: state.sourceTokenPriceInUSD,
      toTokenPrice: state.toTokenPriceInUSD,
      sourceTokenAmount: state.sourceTokenAmount
    })

    const isInsufficientToken = this.hasInsufficientToken(
      state.sourceTokenAmount,
      sourceToken.address
    )

    if (isInsufficientToken) {
      state.inputError = 'Insufficient balance'
    } else {
      state.inputError = undefined
      const transaction = await this.getTransaction()
      this.setTransactionDetails(transaction)
    }

    state.loading = false
  },

  // -- Create Transactions -------------------------------------- //
  async getTransaction() {
    const { fromCaipAddress, availableToSwap } = this.getParams()
    const sourceToken = state.sourceToken
    const toToken = state.toToken

    if (!fromCaipAddress || !availableToSwap || !sourceToken || !toToken || !state.loading) {
      return undefined
    }

    try {
      state.loading = true
      const hasAllowance = await SwapApiUtil.fetchSwapAllowance({
        userAddress: fromCaipAddress,
        tokenAddress: sourceToken.address,
        sourceTokenAmount: state.sourceTokenAmount,
        sourceTokenDecimals: sourceToken.decimals
      })

      let transaction: TransactionParams | undefined = undefined

      if (hasAllowance) {
        transaction = await this.createSwapTransaction()
      } else {
        transaction = await this.createAllowanceTransaction()
      }
      state.loading = false
      state.fetchError = false

      return transaction
    } catch (error) {
      SnackController.showError('Failed to check allowance')
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true
      return undefined
    }
  },

  async createAllowanceTransaction() {
    const { fromCaipAddress, fromAddress, sourceTokenAddress, toTokenAddress } = this.getParams()

    if (!fromCaipAddress || !toTokenAddress) {
      return undefined
    }

    if (!sourceTokenAddress) {
      throw new Error('>>> createAllowanceTransaction - No source token address found.')
    }

    try {
      const response = await BlockchainApiController.generateApproveCalldata({
        projectId: OptionsController.state.projectId,
        from: sourceTokenAddress,
        to: toTokenAddress,
        userAddress: fromCaipAddress
      })
      const gasLimit = await ConnectionController.estimateGas({
        address: fromAddress as `0x${string}`,
        to: CoreHelperUtil.getPlainAddress(response.tx.to) as `0x${string}`,
        data: response.tx.data
      })

      const transaction = {
        data: response.tx.data,
        to: CoreHelperUtil.getPlainAddress(response.tx.from) as `0x${string}`,
        gas: gasLimit,
        gasPrice: BigInt(response.tx.eip155.gasPrice),
        value: BigInt(response.tx.value),
        toAmount: state.toTokenAmount
      }

      state.swapTransaction = undefined
      state.approvalTransaction = transaction
      return transaction
    } catch (error) {
      SnackController.showError('Failed to create approval transaction')
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true
      return undefined
    }
  },

  async createSwapTransaction() {
    const { networkAddress, fromCaipAddress, sourceTokenAmount } = this.getParams()
    const sourceToken = state.sourceToken
    const toToken = state.toToken

    if (!fromCaipAddress || !sourceTokenAmount || !sourceToken || !toToken) {
      return undefined
    }

    const amount = ConnectionController.parseUnits(
      sourceTokenAmount,
      sourceToken.decimals
    ).toString()

    try {
      const response = await BlockchainApiController.generateSwapCalldata({
        projectId: OptionsController.state.projectId,
        userAddress: fromCaipAddress,
        from: sourceToken.address,
        to: toToken.address,
        amount
      })

      const isSourceTokenIsNetworkToken = sourceToken.address === networkAddress

      const gas = BigInt(response.tx.eip155.gas)
      const gasPrice = BigInt(response.tx.eip155.gasPrice)

      const transaction = {
        data: response.tx.data,
        to: CoreHelperUtil.getPlainAddress(response.tx.to) as `0x${string}`,
        gas,
        gasPrice,
        value: isSourceTokenIsNetworkToken ? BigInt(amount) : BigInt('0'),
        toAmount: state.toTokenAmount
      }

      state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gas, gasPrice)

      state.approvalTransaction = undefined
      state.swapTransaction = transaction
      return transaction
    } catch (error) {
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true
      return undefined
    }
  },

  // -- Send Transactions --------------------------------- //
  async sendTransactionForApproval(data: TransactionParams) {
    const { fromAddress } = this.getParams()
    state.transactionLoading = true

    RouterController.pushTransactionStack({
      view: null,
      goBack: true
    })

    try {
      await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
        value: BigInt(data.value),
        gasPrice: BigInt(data.gasPrice)
      })

      state.approvalTransaction = undefined
      state.transactionLoading = false
      this.swapTokens()
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.shortMessage as unknown as string
      state.transactionLoading = false
    }
  },

  async sendTransactionForSwap(data: TransactionParams | undefined) {
    if (!data) {
      return undefined
    }

    const { fromAddress, toTokenAmount } = this.getParams()

    state.transactionLoading = true

    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false,
      onSuccess() {
        SwapController.resetState()
      }
    })

    try {
      const successMessage = `Swapped ${state.sourceToken
        ?.symbol} to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken
        ?.symbol}!`
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
        gas: data.gas,
        gasPrice: BigInt(data.gasPrice),
        value: data.value
      })
      state.transactionLoading = false

      SnackController.showSuccess(successMessage)
      SwapController.resetState()
      SwapController.getMyTokensWithBalance()

      return transactionHash
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.shortMessage
      state.transactionLoading = false
      SnackController.showError(error?.shortMessage || 'Transaction error')

      return undefined
    }
  },

  // -- Checks -------------------------------------------- //
  hasInsufficientToken(sourceTokenAmount: string, sourceTokenAddress: string) {
    const isInsufficientSourceTokenForSwap = SwapCalculationUtil.isInsufficientSourceTokenForSwap(
      sourceTokenAmount,
      sourceTokenAddress,
      state.myTokensWithBalance
    )
    const insufficientNetworkTokenForGas = SwapCalculationUtil.isInsufficientNetworkTokenForGas(
      state.networkBalanceInUSD,
      state.gasPriceInUSD
    )

    if (insufficientNetworkTokenForGas || isInsufficientSourceTokenForSwap) {
      return true
    }

    return false
  },

  // -- Calculations -------------------------------------- //
  setTransactionDetails(transaction: TransactionParams | undefined) {
    const { toTokenAddress, toTokenDecimals } = this.getParams()

    if (!transaction || !toTokenAddress || !toTokenDecimals) {
      return
    }

    state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(
      state.networkPrice,
      transaction.gas,
      transaction.gasPrice
    )
    state.priceImpact = SwapCalculationUtil.getPriceImpact({
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenPriceInUSD: state.sourceTokenPriceInUSD,
      toTokenPriceInUSD: state.toTokenPriceInUSD,
      toTokenAmount: state.toTokenAmount,
      gasPriceInUSD: state.gasPriceInUSD
    })
    state.maxSlippage = SwapCalculationUtil.getMaxSlippage(state.slippage, state.toTokenAmount)
    state.providerFee = SwapCalculationUtil.getProviderFee(state.sourceTokenAmount)
  }
}
