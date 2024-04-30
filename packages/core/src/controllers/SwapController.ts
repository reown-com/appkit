import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import { SnackController } from './SnackController.js'
import { RouterController } from './RouterController.js'
import { NumberUtil } from '@web3modal/common'
import type { SwapTokenWithBalance } from '../utils/TypeUtil.js'
import { NetworkController } from './NetworkController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'

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
  initialized: boolean
  loadingPrices: boolean
  loading?: boolean

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
const state = proxy<SwapControllerState>({
  // Loading states
  initialized: false,
  loading: false,
  loadingPrices: false,

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
  maxSlippage: undefined
})

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
      invalidToToken: !state.toToken?.address || !state.toToken?.decimals,
      invalidSourceToken: !state.sourceToken?.address || !state.sourceToken?.decimals,
      invalidSourceTokenAmount:
        !state.sourceTokenAmount || parseFloat(state.sourceTokenAmount) === 0
    }
  },

  setLoading(loading: boolean) {
    state.loading = loading
  },

  setSourceToken(sourceToken: SwapTokenWithBalance | undefined) {
    if (!sourceToken) {
      return
    }

    state.sourceToken = sourceToken
    this.setTokenPrice(sourceToken.address, 'sourceToken')
  },

  setSourceTokenAmount(amount: string) {
    state.sourceTokenAmount = amount
  },

  async setToToken(toToken: SwapTokenWithBalance | undefined) {
    if (!toToken) {
      state.toToken = toToken
      state.toTokenAmount = ''
      state.toTokenPriceInUSD = 0

      return
    }

    state.toToken = toToken
    this.setTokenPrice(toToken.address, 'toToken')
  },

  async setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
  },

  async setTokenPrice(address: string, target: SwapInputTarget) {
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
    state.loadingPrices = false
  },

  switchTokens() {
    const newSourceToken = state.toToken ? { ...state.toToken } : undefined
    const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined
    const newSourceTokenAmount = state.toTokenAmount

    this.setSourceToken(newSourceToken)
    this.setToToken(newToToken)

    this.setSourceTokenAmount(newSourceTokenAmount)
    this.setToTokenAmount('')
    this.swapTokens()
  },

  resetTokens() {
    state.tokens = undefined
    state.popularTokens = undefined
    state.myTokensWithBalance = undefined
    state.initialized = false
    state.networkPrice = '0'
    state.networkBalanceInUSD = '0'
  },

  resetValues() {
    const { networkAddress } = this.getParams()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)
    this.setSourceToken(networkToken)
    state.sourceTokenPriceInUSD = state.tokensPriceMap[networkAddress] || 0
    state.sourceTokenAmount = ''
    this.setToToken(undefined)
    state.gasPriceInUSD = 0
    state.initialized = false
  },

  clearError() {
    state.transactionError = undefined
  },

  async initializeState() {
    if (!state.initialized) {
      await this.fetchTokens()
      state.initialized = true
    }
  },

  async fetchTokens() {
    const { networkAddress } = this.getParams()

    await this.getTokenList()
    await this.getNetworkTokenPrice()
    await this.getMyTokensWithBalance()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)

    if (networkToken) {
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
        if (ConstantsUtil.POPULAR_TOKENS.includes(token.symbol)) {
          return true
        }

        return false
      }, {})
    state.suggestedTokens = tokens.filter(token => {
      if (ConstantsUtil.SUGGESTED_TOKENS.includes(token.symbol)) {
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
    const price = fungibles.find(p => p.symbol === symbol)?.price || '0'
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
      return
    }

    const value = res.instant
    const gasFee = BigInt(value)
    const gasLimit = BigInt(INITIAL_GAS_LIMIT)
    const gasPrice = this.calculateGasPriceInUSD(gasLimit, gasFee)

    state.gasPriceInUSD = gasPrice
  },

  async refreshSwapValues() {
    const { fromAddress, toTokenDecimals, toTokenAddress } = this.getParams()

    if (fromAddress && toTokenAddress && toTokenDecimals && !state.loading) {
      const transaction = await this.getTransaction()
      this.setTransactionDetails(transaction)
    }
  },

  // -- Calculations -------------------------------------- //
  calculateGasPriceInEther(gas: bigint, gasPrice: bigint) {
    const totalGasCostInWei = gasPrice * gas
    const totalGasCostInEther = Number(totalGasCostInWei) / 1e18

    return totalGasCostInEther
  },

  calculateGasPriceInUSD(gas: bigint, gasPrice: bigint) {
    const totalGasCostInEther = this.calculateGasPriceInEther(gas, gasPrice)
    const networkPriceInUSD = NumberUtil.bigNumber(state.networkPrice)
    const gasCostInUSD = networkPriceInUSD.multipliedBy(totalGasCostInEther)

    return gasCostInUSD.toNumber()
  },

  calculatePriceImpact(toTokenAmount: string, gasPriceInUSD: number) {
    const sourceTokenAmount = state.sourceTokenAmount
    const sourceTokenPrice = state.sourceTokenPriceInUSD
    const toTokenPrice = state.toTokenPriceInUSD

    const totalCostInUSD = NumberUtil.bigNumber(sourceTokenAmount)
      .multipliedBy(sourceTokenPrice)
      .plus(gasPriceInUSD)
    const effectivePricePerToToken = totalCostInUSD.dividedBy(toTokenAmount)
    const priceImpact = effectivePricePerToToken
      .minus(toTokenPrice)
      .dividedBy(toTokenPrice)
      .multipliedBy(100)

    return priceImpact.toNumber()
  },

  calculateMaxSlippage() {
    const slippageToleranceDecimal = NumberUtil.bigNumber(state.slippage).dividedBy(100)
    const maxSlippageAmount = NumberUtil.multiply(state.sourceTokenAmount, slippageToleranceDecimal)

    return maxSlippageAmount.toNumber()
  },

  // -- Transactions -------------------------------------- //
  async swapTokens() {
    const { fromCaipAddress, invalidSourceToken, invalidSourceTokenAmount, invalidToToken } =
      this.getParams()

    if (!fromCaipAddress || invalidSourceToken || invalidSourceTokenAmount || invalidToToken) {
      return
    }

    if (state.loadingPrices) {
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (!state.loadingPrices) {
            clearInterval(interval)
            resolve()
          }
        }, 500)
      })
    }

    state.loading = true
    state.toTokenAmount = this.getToAmount()
    const transaction = await this.getTransaction()
    this.setTransactionDetails(transaction)
    state.loading = false
  },

  async getTransaction() {
    const { fromCaipAddress, sourceTokenAddress, sourceTokenAmount, sourceTokenDecimals } =
      this.getParams()

    if (!fromCaipAddress || !sourceTokenAddress || !sourceTokenAmount || !sourceTokenDecimals) {
      return undefined
    }

    const isInsufficientSourceTokenForSwap = this.isInsufficientSourceTokenForSwap()
    const insufficientNetworkTokenForGas = this.isInsufficientNetworkTokenForGas()

    if (insufficientNetworkTokenForGas || isInsufficientSourceTokenForSwap) {
      state.inputError = 'Insufficient balance'
      return undefined
    } else {
      state.inputError = undefined
    }

    const hasAllowance = await SwapApiUtil.fetchSwapAllowance({
      userAddress: fromCaipAddress,
      tokenAddress: sourceTokenAddress,
      sourceTokenAmount,
      sourceTokenDecimals
    })

    let transaction: TransactionParams | undefined = undefined

    if (hasAllowance) {
      state.approvalTransaction = undefined
      transaction = await this.createSwap()
      state.swapTransaction = transaction
    } else {
      state.swapTransaction = undefined
      transaction = await this.createTokenAllowance()
      state.approvalTransaction = transaction
    }

    return transaction
  },

  getToAmount() {
    const { sourceTokenDecimals, toTokenDecimals } = this.getParams()

    const isToTokenPriceInvalid = state.toTokenPriceInUSD <= 0

    if (!toTokenDecimals || !sourceTokenDecimals || isToTokenPriceInvalid) {
      return '0'
    }

    const decimalDifference = sourceTokenDecimals - toTokenDecimals
    const sourceAmountInSmallestUnit = NumberUtil.bigNumber(state.sourceTokenAmount).multipliedBy(
      NumberUtil.bigNumber(10).pow(sourceTokenDecimals)
    )
    const priceRatio = NumberUtil.bigNumber(state.sourceTokenPriceInUSD).dividedBy(
      state.toTokenPriceInUSD
    )
    const toTokenAmountInSmallestUnit = sourceAmountInSmallestUnit
      .multipliedBy(priceRatio)
      .dividedBy(NumberUtil.bigNumber(10).pow(decimalDifference))

    const toTokenAmount = toTokenAmountInSmallestUnit.dividedBy(
      NumberUtil.bigNumber(10).pow(toTokenDecimals)
    )
    const amount = toTokenAmount.toFixed(toTokenDecimals).toString()

    return amount
  },

  async createTokenAllowance() {
    const { fromCaipAddress, fromAddress, sourceTokenAddress, toTokenAddress } = this.getParams()

    if (!fromCaipAddress || !toTokenAddress) {
      return undefined
    }

    if (!sourceTokenAddress) {
      throw new Error('>>> createTokenAllowance - No source token address found.')
    }

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

    return transaction
  },

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

  async createSwap() {
    const {
      networkAddress,
      fromCaipAddress,
      sourceTokenAddress,
      sourceTokenDecimals,
      sourceTokenAmount,
      toTokenAddress
    } = this.getParams()

    if (
      !fromCaipAddress ||
      !sourceTokenAmount ||
      !sourceTokenAddress ||
      !toTokenAddress ||
      !sourceTokenDecimals
    ) {
      return undefined
    }

    try {
      const amount = ConnectionController.parseUnits(
        sourceTokenAmount,
        sourceTokenDecimals
      ).toString()

      const response = await BlockchainApiController.generateSwapCalldata({
        projectId: OptionsController.state.projectId,
        userAddress: fromCaipAddress,
        from: sourceTokenAddress,
        to: toTokenAddress,
        amount
      })

      const isSourceTokenIsNetworkToken = sourceTokenAddress === networkAddress

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

      state.gasPriceInUSD = this.calculateGasPriceInUSD(gas, gasPrice)

      return transaction
    } catch (error) {
      return undefined
    }
  },

  async sendTransactionForSwap(data: TransactionParams | undefined) {
    if (!data) {
      return undefined
    }

    const { fromAddress } = this.getParams()

    state.transactionLoading = true

    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false,
      onSuccess() {
        SwapController.resetValues()
      }
    })

    try {
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
        gas: data.gas,
        gasPrice: BigInt(data.gasPrice),
        value: data.value
      })
      state.transactionLoading = false

      SwapController.resetValues()
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

  getToTokenValues() {
    const { toTokenAddress, toTokenAmount } = this.getParams()

    if (!toTokenAddress) {
      return {
        toTokenAmount: '0',
        toTokenPriceInUSD: 0
      }
    }

    const toTokenPrice = state.tokensPriceMap[toTokenAddress] || '0'
    const toTokenPriceInUSD = NumberUtil.bigNumber(toTokenPrice).toNumber()

    return {
      toTokenAmount,
      toTokenPriceInUSD
    }
  },

  isInsufficientNetworkTokenForGas() {
    if (NumberUtil.bigNumber(state.networkBalanceInUSD).isZero()) {
      return true
    }

    return NumberUtil.bigNumber(NumberUtil.bigNumber(state.gasPriceInUSD || '0')).isGreaterThan(
      state.networkBalanceInUSD
    )
  },

  isInsufficientSourceTokenForSwap() {
    const { sourceTokenAmount, sourceTokenAddress } = this.getParams()

    const sourceTokenBalance = state.myTokensWithBalance?.find(
      token => token.address === sourceTokenAddress
    )?.quantity?.numeric

    const isInSufficientBalance = NumberUtil.bigNumber(sourceTokenBalance || '0').isLessThan(
      sourceTokenAmount
    )

    return isInSufficientBalance
  },

  setTransactionDetails(transaction: TransactionParams | undefined) {
    const { toTokenAddress, toTokenDecimals } = this.getParams()

    if (!transaction || !toTokenAddress || !toTokenDecimals) {
      return
    }

    const { toTokenAmount, toTokenPriceInUSD } = this.getToTokenValues()

    state.toTokenAmount = toTokenAmount
    state.toTokenPriceInUSD = toTokenPriceInUSD
    state.gasPriceInUSD = this.calculateGasPriceInUSD(transaction.gas, transaction.gasPrice)
    state.priceImpact = this.calculatePriceImpact(state.toTokenAmount, state.gasPriceInUSD)
    state.maxSlippage = this.calculateMaxSlippage()
  }
}
