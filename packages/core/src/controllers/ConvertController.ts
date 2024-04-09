import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { ConvertApiUtil } from '../utils/ConvertApiUtil.js'
import { SnackController } from './SnackController.js'
import { RouterController } from './RouterController.js'
import { NumberUtil } from '@web3modal/common'

const INITIAL_GAS_LIMIT = 150000

// -- Types --------------------------------------------- //
type TransactionParams = {
  data: `0x${string}`
  to: `0x${string}`
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

export interface ConvertControllerState {
  // Loading states
  initialized: boolean
  loadingPrices: boolean
  loading?: boolean

  // Approval & Convert transaction states
  approvalTransaction: TransactionParams | undefined
  convertTransaction: TransactionParams | undefined
  transactionLoading?: boolean
  transactionError?: string

  // Input values
  sourceToken?: TokenInfo
  sourceTokenAmount: string
  sourceTokenPriceInUSD: number
  toToken?: TokenInfo
  toTokenAmount: string
  toTokenPriceInUSD: number
  networkPrice: string
  networkBalanceInUSD: string
  inputError: string | undefined

  // Request values
  slippage: string

  // Tokens
  tokens?: Record<string, TokenInfo>
  suggestedTokens?: Record<string, TokenInfo>
  popularTokens?: Record<string, TokenInfo>
  foundTokens?: TokenInfo[]
  myTokensWithBalance?: Record<string, TokenInfoWithBalance>
  tokensPriceMap: Record<string, string>

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

export interface TokenInfoWithPrice extends TokenInfo {
  price: string
}

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string
  price: string
}

type StateKey = keyof ConvertControllerState

// -- State --------------------------------------------- //
const state = proxy<ConvertControllerState>({
  // Loading states
  initialized: false,
  loading: false,
  loadingPrices: false,

  // Approval & Convert transaction states
  approvalTransaction: undefined,
  convertTransaction: undefined,
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
export const ConvertController = {
  state,

  subscribe(callback: (newState: ConvertControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConvertControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  getParams() {
    const { address } = AccountController.state

    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    return {
      fromAddress: address as `0x${string}`,
      sourceTokenAddress: state.sourceToken?.address,
      toTokenAddress: state.toToken?.address,
      toTokenAmount: state.toTokenAmount,
      toTokenDecimals: state.toToken?.decimals,
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenDecimals: state.sourceToken?.decimals
    }
  },

  setLoading(loading: boolean) {
    ConvertController.state.loading = loading
  },

  setSourceToken(sourceToken: TokenInfo | undefined) {
    if (!sourceToken) {
      return
    }

    state.sourceToken = sourceToken
    this.setTokenValues(sourceToken.address, 'sourceToken')
  },

  setSourceTokenAmount(amount: string) {
    const { sourceTokenAddress } = this.getParams()

    state.sourceTokenAmount = amount

    if (sourceTokenAddress) {
      this.setTokenValues(sourceTokenAddress, 'sourceToken')
    }
  },

  setToToken(toToken: TokenInfo | undefined) {
    const { sourceTokenAddress, sourceTokenAmount } = this.getParams()

    if (!toToken) {
      return
    }

    state.toToken = toToken
    this.setTokenValues(toToken.address, 'toToken')

    if (sourceTokenAddress && sourceTokenAmount) {
      this.makeChecks()
    }
  },

  setToTokenAmount(amount: string) {
    const { toTokenAddress } = this.getParams()

    state.toTokenAmount = amount

    if (toTokenAddress) {
      this.setTokenValues(toTokenAddress, 'toToken')
    }
  },

  async setTokenValues(address: string, target: 'sourceToken' | 'toToken') {
    const price = await this.getAddressPrice(address)

    if (target === 'sourceToken') {
      state.sourceTokenPriceInUSD = price
    } else if (target === 'toToken') {
      state.toTokenPriceInUSD = price
    }
  },

  switchTokens() {
    const newSourceToken = state.toToken ? { ...state.toToken } : undefined
    const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined

    this.setSourceToken(newSourceToken)
    this.setToToken(newToToken)

    this.setSourceTokenAmount(state.toTokenAmount || '0')
    ConvertController.convertTokens()
  },

  resetTokens() {
    state.tokens = undefined
    state.popularTokens = undefined
    state.myTokensWithBalance = undefined
    state.initialized = false
  },

  resetValues() {
    const networkToken = state.tokens?.[ConstantsUtil.NATIVE_TOKEN_ADDRESS]
    this.setSourceToken(networkToken)
    state.toToken = undefined
    state.sourceTokenAmount = '0'
    state.toTokenAmount = '0'
    state.sourceTokenPriceInUSD = 0
    state.toTokenPriceInUSD = 0
    state.gasPriceInUSD = 0
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
    await this.getTokenList()
    await this.getNetworkTokenPrice()
    await this.getMyTokensWithBalance()
  },

  async getTokenList() {
    const res = await ConvertApiUtil.getTokenList()

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
    state.suggestedTokens = Object.entries(res.tokens).reduce<Record<string, TokenInfo>>(
      (limitedTokens, [tokenAddress, tokenInfo]) => {
        if (ConstantsUtil.SUGGESTED_TOKENS.includes(tokenInfo.symbol)) {
          limitedTokens[tokenAddress] = tokenInfo
        }

        return limitedTokens
      },
      {}
    )
    const networkToken = res.tokens[ConstantsUtil.NATIVE_TOKEN_ADDRESS]
    this.setSourceToken(networkToken)

    return state.tokens
  },

  async getAddressPrice(address: string) {
    const existPrice = state.tokensPriceMap[address]
    if (existPrice) {
      return parseFloat(existPrice)
    }
    const prices = await ConvertApiUtil.getTokenPriceWithAddresses([address])
    const price = prices[address] || '0'
    state.tokensPriceMap[address] = price

    return parseFloat(price)
  },

  async getNetworkTokenPrice() {
    const prices = await ConvertApiUtil.getTokenPriceWithAddresses([
      ConstantsUtil.NATIVE_TOKEN_ADDRESS
    ])
    const price = prices[ConstantsUtil.NATIVE_TOKEN_ADDRESS] || '0'
    state.tokensPriceMap[ConstantsUtil.NATIVE_TOKEN_ADDRESS] = price
    state.networkPrice = price
  },

  async getMyTokensWithBalance() {
    const res = await ConvertApiUtil.getMyTokensWithBalance()

    if (!res) {
      return
    }

    await this.getInitialGasPrice()

    const networkToken = res[ConstantsUtil.NATIVE_TOKEN_ADDRESS]

    state.tokensPriceMap = Object.entries(res).reduce<Record<string, string>>(
      (prices, [tokenAddress, tokenInfo]) => {
        prices[tokenAddress] = tokenInfo.price

        return prices
      },
      {}
    )
    state.myTokensWithBalance = res
    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.balance, networkToken.price).toString()
      : '0'
  },

  async getInitialGasPrice() {
    const res = await ConvertApiUtil.getGasPrice()
    const instant = res.instant
    const value = typeof instant === 'object' ? res.instant.maxFeePerGas : instant
    const gasFee = BigInt(value)
    const gasLimit = BigInt(INITIAL_GAS_LIMIT)
    const gasPrice = this.calculateGasPriceInUSD(gasLimit, gasFee)
    state.gasPriceInUSD = gasPrice

    return { gasPrice: gasFee, gasPriceInUsd: state.gasPriceInUSD }
  },

  async refreshConvertValues() {
    const { fromAddress, toTokenDecimals, toTokenAddress } = this.getParams()

    if (fromAddress && toTokenAddress && toTokenDecimals && !state.loading) {
      const transaction = await this.getTransaction()
      this.setTransactionDetails(transaction)
    }
  },

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

  async convertTokens() {
    const { sourceTokenAddress, toTokenAddress } = this.getParams()

    if (!sourceTokenAddress || !toTokenAddress) {
      return
    }

    await this.makeChecks()
  },

  async makeChecks() {
    const { toTokenDecimals, toTokenAddress } = this.getParams()

    if (!toTokenDecimals || !toTokenAddress) {
      return
    }

    state.loading = true
    const transaction = await this.getTransaction()
    this.setTransactionDetails(transaction)
    state.loading = false
  },

  async getTransaction() {
    const { fromAddress, sourceTokenAddress, sourceTokenAmount, sourceTokenDecimals } =
      this.getParams()

    if (
      !sourceTokenAddress ||
      !sourceTokenAmount ||
      parseFloat(sourceTokenAmount) === 0 ||
      !sourceTokenDecimals
    ) {
      return null
    }

    const hasAllowance = await ConvertApiUtil.checkConvertAllowance({
      fromAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      sourceTokenDecimals
    })

    let transaction: TransactionParams | null = null

    if (hasAllowance) {
      state.approvalTransaction = undefined
      transaction = await this.createConvert()
      state.convertTransaction = transaction || undefined
    } else {
      state.convertTransaction = undefined
      transaction = await this.createTokenAllowance()
      state.approvalTransaction = transaction
    }

    return transaction
  },

  getToAmount() {
    const { sourceTokenDecimals } = this.getParams()
    const decimals = sourceTokenDecimals || 18
    const multiplyer = 10 ** decimals

    const toTokenConvertedAmount =
      state.sourceTokenPriceInUSD && state.toTokenPriceInUSD && state.sourceTokenAmount
        ? NumberUtil.bigNumber(state.sourceTokenAmount)
            .multipliedBy(state.sourceTokenPriceInUSD)
            .dividedBy(state.toTokenPriceInUSD)
        : NumberUtil.bigNumber(0)

    return toTokenConvertedAmount.multipliedBy(multiplyer).toString()
  },

  async createTokenAllowance() {
    const { fromAddress, sourceTokenAddress } = this.getParams()

    if (!sourceTokenAddress) {
      throw new Error('>>> createTokenAllowance - No source token address found.')
    }

    const transaction = await ConvertApiUtil.getConvertApprovalData({
      sourceTokenAddress
    })

    const gasLimit = await ConnectionController.getEstimatedGas({
      address: fromAddress,
      to: transaction.to,
      data: transaction.data
    })

    const toAmount = this.getToAmount()

    return {
      ...transaction,
      gas: gasLimit,
      gasPrice: BigInt(transaction.gasPrice),
      value: BigInt(transaction.value),
      toAmount
    }
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
        address: fromAddress,
        to: data.to,
        data: data.data,
        value: BigInt(data.value),
        gasPrice: BigInt(data.gasPrice)
      })

      state.approvalTransaction = undefined
      state.transactionLoading = false
      this.makeChecks()
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.shortMessage as unknown as string
      state.transactionLoading = false
      SnackController.showError(error?.shortMessage || 'Transaction error')
    }
  },

  async createConvert() {
    const {
      fromAddress,
      sourceTokenAddress,
      sourceTokenDecimals,
      sourceTokenAmount,
      toTokenAddress
    } = this.getParams()

    if (!sourceTokenAmount || !sourceTokenAddress || !toTokenAddress || !sourceTokenDecimals) {
      return null
    }

    try {
      const response = await ConvertApiUtil.getConvertData({
        fromAddress,
        sourceTokenAddress,
        sourceTokenAmount,
        toTokenAddress,
        decimals: sourceTokenDecimals
      })

      const transaction = {
        data: response.tx.data,
        to: response.tx.to,
        gas: BigInt(response.tx.gas),
        gasPrice: BigInt(response.tx.gasPrice),
        value: BigInt(response.tx.value),
        toAmount: response.toAmount
      }

      state.gasPriceInUSD = this.calculateGasPriceInUSD(
        BigInt(response.tx.gas),
        transaction.gasPrice
      )

      return transaction
    } catch (error) {
      return null
    }
  },

  async sendTransactionForConvert(data: TransactionParams | undefined) {
    if (!data) {
      return undefined
    }

    const { fromAddress } = this.getParams()

    state.transactionLoading = true

    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false,
      onSuccess() {
        ConvertController.resetValues()
      }
    })

    try {
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress,
        to: data.to,
        data: data.data,
        gas: data.gas,
        gasPrice: BigInt(data.gasPrice),
        value: data.value
      })
      state.transactionLoading = false

      setTimeout(() => {
        this.resetValues()
        this.getMyTokensWithBalance()
      }, 1000)

      return transactionHash
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.shortMessage
      state.transactionLoading = false
      SnackController.showError(error?.shortMessage || 'Transaction error')

      return undefined
    }
  },

  setTransactionDetails(transaction: TransactionParams | null) {
    const { sourceTokenAddress, toTokenAddress, toTokenDecimals } = this.getParams()

    if (!transaction || !toTokenAddress || !toTokenDecimals) {
      return
    }

    const toTokenPrice = state.tokensPriceMap[toTokenAddress] || '0'
    state.toTokenAmount = NumberUtil.bigNumber(transaction.toAmount)
      .dividedBy(10 ** toTokenDecimals)
      .toFixed(20)
    state.toTokenPriceInUSD = NumberUtil.bigNumber(toTokenPrice).toNumber()
    state.gasPriceInUSD = this.calculateGasPriceInUSD(transaction.gas, transaction.gasPrice)

    const isSourceTokenIsNetworkToken = sourceTokenAddress === ConstantsUtil.NATIVE_TOKEN_ADDRESS
    const totalNativeTokenCostInUSD = isSourceTokenIsNetworkToken
      ? NumberUtil.bigNumber(state.sourceTokenPriceInUSD).plus(state.gasPriceInUSD)
      : state.gasPriceInUSD
    const insufficientBalance = NumberUtil.bigNumber(totalNativeTokenCostInUSD).isGreaterThan(
      state.networkBalanceInUSD
    )

    if (insufficientBalance) {
      state.inputError = insufficientBalance ? 'Insufficient balance' : undefined
    }

    state.priceImpact = this.calculatePriceImpact(state.toTokenAmount, state.gasPriceInUSD)
    state.maxSlippage = this.calculateMaxSlippage()
  }
}
