import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { ConvertApiUtil } from '../utils/ConvertApiUtil.js'
import { SnackController } from './SnackController.js'
import { RouterController } from './RouterController.js'
import { NumberUtil } from '@web3modal/common'
import type { ConvertTokenWithBalance } from '../utils/TypeUtil.js'
import { NetworkController } from './NetworkController.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { OptionsController } from './OptionsController.js'

export const INITIAL_GAS_LIMIT = 150000

// -- Types --------------------------------------------- //
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
  sourceToken?: ConvertTokenWithBalance
  sourceTokenAmount: string
  sourceTokenPriceInUSD: number
  toToken?: ConvertTokenWithBalance
  toTokenAmount: string
  toTokenPriceInUSD: number
  networkPrice: string
  networkBalanceInUSD: string
  inputError: string | undefined

  // Request values
  slippage: number

  // Tokens
  tokens?: ConvertTokenWithBalance[]
  suggestedTokens?: ConvertTokenWithBalance[]
  popularTokens?: ConvertTokenWithBalance[]
  foundTokens?: ConvertTokenWithBalance[]
  myTokensWithBalance?: ConvertTokenWithBalance[]
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
      sourceTokenDecimals: state.sourceToken?.decimals
    }
  },

  setLoading(loading: boolean) {
    state.loading = loading
  },

  setSourceToken(sourceToken: ConvertTokenWithBalance | undefined) {
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

  setToToken(toToken: ConvertTokenWithBalance | undefined) {
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
    let price = state.tokensPriceMap[`${NetworkController.state.caipNetwork?.id}:${address}`] || 0

    if (!price) {
      price = await this.getAddressPrice(address)
    }

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
    const { networkAddress } = this.getParams()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)
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
    const { networkAddress } = this.getParams()

    await this.getTokenList()
    await this.getNetworkTokenPrice()
    await this.getMyTokensWithBalance()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)

    if (networkToken) {
      this.setSourceToken(networkToken)
    }
  },

  async getTokenList() {
    const tokens = await ConvertApiUtil.getTokenList()

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
    // TODO: replace with blockchain api
    // const response = await BlockchainApiController.fetchTokenPrice({
    //   projectId: OptionsController.state.projectId,
    //   addresses: [address]
    // })
    // const prices = response.fungibles
    // const price = prices.find(p => p.address === address)?.price || '0'
    const prices = await ConvertApiUtil.getTokenPriceWithAddresses([address])
    const price = prices[address] || '0'
    state.tokensPriceMap[address] = parseFloat(price)

    return parseFloat(price)
  },

  async getNetworkTokenPrice() {
    const { networkAddress } = this.getParams()

    // TODO: replace with blockchain api
    // const response = await BlockchainApiController.fetchTokenPrice({
    //   projectId: OptionsController.state.projectId,
    //   addresses: [networkAddress]
    // })
    // const prices = response.fungibles
    // const price = prices.find(p => p.address === networkAddress)?.price || '0'
    const prices = await ConvertApiUtil.getTokenPriceWithAddresses([
      ConstantsUtil.NATIVE_TOKEN_ADDRESS
    ])
    const price = prices[networkAddress] || '0'
    state.tokensPriceMap[networkAddress] = parseFloat(price)
    state.networkPrice = price
  },

  async getMyTokensWithBalance() {
    const { networkAddress } = this.getParams()
    const balances = await ConvertApiUtil.getMyTokensWithBalance()

    if (!balances) {
      return
    }

    await this.getInitialGasPrice()

    const networkToken = balances.find(token => token.address === networkAddress)

    balances.forEach(token => {
      state.tokensPriceMap[token.address] = token.price || 0
    })
    state.myTokensWithBalance = balances as ConvertTokenWithBalance[]
    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
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
      return undefined
    }

    // TODO: replace with blockchain api
    const hasAllowance = await ConvertApiUtil.checkConvertAllowance({
      fromAddress,
      sourceTokenAddress: CoreHelperUtil.getPlainAddress(sourceTokenAddress) as string,
      sourceTokenAmount,
      sourceTokenDecimals
    })

    let transaction: TransactionParams | undefined = undefined

    if (hasAllowance) {
      state.approvalTransaction = undefined
      transaction = await this.createConvert()
      state.convertTransaction = transaction
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
    const { fromCaipAddress, fromAddress, sourceTokenAddress, sourceTokenAmount, toTokenAddress } =
      this.getParams()

    if (!fromCaipAddress || !toTokenAddress) {
      return undefined
    }

    if (!sourceTokenAddress) {
      throw new Error('>>> createTokenAllowance - No source token address found.')
    }

    const response = await BlockchainApiController.generateApproveCalldata({
      projectId: OptionsController.state.projectId,
      from: sourceTokenAddress,
      amount: parseInt(sourceTokenAmount), // Todo: this is not used right now but we should update find the best way/format to set it
      to: toTokenAddress,
      userAddress: fromCaipAddress
    })

    const gasLimit = await ConnectionController.getEstimatedGas({
      address: fromAddress as `0x${string}`,
      to: CoreHelperUtil.getPlainAddress(response.tx.to) as `0x${string}`,
      data: response.tx.data
    })

    const toAmount = this.getToAmount()

    const transaction = {
      data: response.tx.data,
      to: CoreHelperUtil.getPlainAddress(response.tx.from),
      gas: gasLimit,
      gasPrice: BigInt(response.tx.eip155.gasPrice),
      value: BigInt(response.tx.value),
      toAmount
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
      this.makeChecks()
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.shortMessage as unknown as string
      state.transactionLoading = false
    }
  },

  async createConvert() {
    const {
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
      const amount = parseInt(
        ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals).toString()
      )

      const response = await BlockchainApiController.generateConvertCalldata({
        projectId: OptionsController.state.projectId,
        userAddress: fromCaipAddress,
        from: sourceTokenAddress,
        to: toTokenAddress,
        amount
      })

      const toAmount = this.getToAmount()
      const gas = BigInt(parseInt(response.tx.eip155.gas))
      const gasPrice = BigInt(response.tx.eip155.gasPrice)

      const transaction = {
        data: response.tx.data,
        to: CoreHelperUtil.getPlainAddress(response.tx.to),
        gas,
        gasPrice,
        value: BigInt(amount),
        toAmount: toAmount
      }

      state.gasPriceInUSD = this.calculateGasPriceInUSD(gas, gasPrice)

      return transaction
    } catch (error) {
      return undefined
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
      console.log('>>> data', data, fromAddress)
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
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
      console.log('>>> error', err)
      SnackController.showError(error?.shortMessage || 'Transaction error')

      return undefined
    }
  },

  getToTokenValues(amountBigInt: string, decimals: number) {
    const { toTokenAddress } = this.getParams()

    if (!toTokenAddress) {
      return {
        toTokenAmount: '0',
        toTokenPriceInUSD: 0
      }
    }

    const toTokenAmount = NumberUtil.bigNumber(amountBigInt)
      .dividedBy(10 ** decimals)
      .toFixed(20)
    const toTokenPrice = state.tokensPriceMap[toTokenAddress] || '0'
    const toTokenPriceInUSD = NumberUtil.bigNumber(toTokenPrice).toNumber()

    return {
      toTokenAmount,
      toTokenPriceInUSD
    }
  },

  isInsufficientNetworkTokenForGas() {
    return NumberUtil.bigNumber(NumberUtil.bigNumber(state.gasPriceInUSD || '0')).isGreaterThan(
      state.networkBalanceInUSD
    )
  },

  setTransactionDetails(transaction: TransactionParams | undefined) {
    const { toTokenAddress, toTokenDecimals } = this.getParams()

    if (!transaction || !toTokenAddress || !toTokenDecimals) {
      return
    }

    const insufficientNetworkToken = this.isInsufficientNetworkTokenForGas()

    if (insufficientNetworkToken) {
      state.inputError = 'Insufficient balance'
    } else {
      state.inputError = undefined
    }

    const { toTokenAmount, toTokenPriceInUSD } = this.getToTokenValues(
      transaction.toAmount,
      toTokenDecimals
    )
    state.toTokenAmount = toTokenAmount
    state.toTokenPriceInUSD = toTokenPriceInUSD
    state.gasPriceInUSD = this.calculateGasPriceInUSD(transaction.gas, transaction.gasPrice)
    state.priceImpact = this.calculatePriceImpact(state.toTokenAmount, state.gasPriceInUSD)
    state.maxSlippage = this.calculateMaxSlippage()
  }
}
