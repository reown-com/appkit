import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from './NetworkController.js'
import { AccountController } from './AccountController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { ConvertApiController, type TransactionData } from './ConvertApiController.js'
import { SnackController } from './SnackController.js'

const CURRENT_CHAIN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const DEFAULT_SLIPPAGE_TOLERANCE = '0.5'

// -- Types --------------------------------------------- //
type PriceDifferenceDirection = 'up' | 'down' | 'none'

export interface ConvertControllerState {
  // Loading states
  initialized: boolean
  loadingPrices: boolean
  loading?: boolean

  // Approval & Convert transaction states
  approvalTransaction: object | undefined
  convertLoading: boolean
  convertTransaction?: TransactionData
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
  networkAddress: string | undefined
  inputError: string | undefined

  // Request values
  slippage: string

  // Tokens
  tokens?: Record<string, TokenInfo>
  popularTokens?: Record<string, TokenInfo>
  foundTokens?: TokenInfo[]
  myTokensWithBalance?: Record<string, TokenInfoWithBalance>
  tokensPriceMap: Record<string, string>

  // Calculations
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
  convertLoading: false,
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
  networkAddress: CURRENT_CHAIN_ADDRESS,
  inputError: undefined,

  // Request values
  slippage: DEFAULT_SLIPPAGE_TOLERANCE,

  // Tokens
  tokens: undefined,
  popularTokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  tokensPriceMap: {},

  // Calculations
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

  setSourceToken(sourceToken: TokenInfo | undefined) {
    if (!sourceToken) {
      return
    }

    state.sourceToken = sourceToken
    if (sourceToken?.address && !state.tokensPriceMap[sourceToken.address]) {
      this.setTokenPriceToMap(sourceToken.address)
    }
  },

  setSourceTokenAmount(amount: string) {
    const { sourceTokenAddress } = this.getParams()

    state.sourceTokenAmount = amount

    if (!sourceTokenAddress) {
      throw new Error('No source token address found')
    }

    this.checkSourceTokenValues(sourceTokenAddress, amount)
  },

  async checkSourceTokenValues(address: string, amount: string) {
    const balance = state.myTokensWithBalance?.[address]?.balance || '0'
    const price = await this.getAddressPrice(address)

    const balancePriceInUSD = parseFloat(balance) * price
    const amountPriceInUSD = parseFloat(amount) * price
    const insufficientBalance = balancePriceInUSD < amountPriceInUSD

    state.sourceTokenPriceInUSD = price
    state.inputError = insufficientBalance ? 'Insufficient balance' : undefined
    if (insufficientBalance) {
      state.toTokenAmount = '0'
      state.toTokenPriceInUSD = 0
    }
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
  },

  setToToken(toToken: TokenInfo | undefined) {
    if (!toToken) {
      return
    }

    state.toToken = toToken
    if (toToken.address && !state.tokensPriceMap[toToken.address]) {
      this.setTokenPriceToMap(toToken.address)
    }
  },

  setLoading(isLoading: boolean) {
    state.loading = isLoading
  },

  switchTokens() {
    const newSourceToken = state.toToken ? Object.assign({}, state.toToken) : undefined
    const newToToken = state.sourceToken ? Object.assign({}, state.sourceToken) : undefined

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

  resetState() {
    state.sourceToken = undefined
    state.toToken = undefined
    state.sourceTokenAmount = '0'
    state.toTokenAmount = '0'
    state.sourceTokenPriceInUSD = 0
    state.toTokenPriceInUSD = 0
    state.gasPriceInUSD = 0
  },

  clearMyTokens() {
    state.myTokensWithBalance = undefined
  },

  clearError() {
    state.transactionError = undefined
  },

  async initializeState() {
    if (!state.initialized) {
      await this.getTokenList()
      await this.getNetworkTokenPrice()
      await this.getMyTokensWithBalance()
      state.initialized = true
    }
  },

  calculatePriceDifference() {
    const sourceTokenValue = parseFloat(state.sourceTokenAmount) * state.sourceTokenPriceInUSD
    const toTokenValue = parseFloat(state.toTokenAmount) * state.toTokenPriceInUSD

    if (!sourceTokenValue || !toTokenValue) {
      return {
        percentage: 0,
        direction: 'none' as PriceDifferenceDirection
      }
    }

    const priceChange = sourceTokenValue - toTokenValue
    console.log(
      '>>> calculatePriceDifference',
      priceChange,
      toTokenValue,
      sourceTokenValue,
      state.sourceTokenAmount,
      state.sourceTokenPriceInUSD,
      state.toTokenAmount,
      state.toTokenPriceInUSD
    )
    const changeInPercentage = (priceChange / toTokenValue) * 100
    let direction: PriceDifferenceDirection = 'none'

    if (changeInPercentage > 0) {
      direction = 'up'
    } else if (changeInPercentage < 0) {
      direction = 'down'
    }

    return {
      percentage: changeInPercentage,
      direction
    }
  },

  async getTokenList() {
    const res = await ConvertApiController.getTokenList()

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

    return state.tokens
  },

  async getAddressPrice(address: string) {
    const existPrice = state.tokensPriceMap[address]
    if (existPrice) {
      return parseFloat(existPrice)
    }
    const prices = await ConvertApiController.getTokenPriceWithAddresses([address])
    const price = prices[address] || '0'
    state.tokensPriceMap[address] = price
    return parseFloat(price)
  },

  async setTokenPriceToMap(address: string) {
    const prices = await ConvertApiController.getTokenPriceWithAddresses([address])
    const price = prices[address] || '0'
    state.tokensPriceMap[address] = price
    if (address === CURRENT_CHAIN_ADDRESS) {
      state.networkPrice = price
    }
  },

  async getNetworkTokenPrice() {
    const prices = await ConvertApiController.getTokenPriceWithAddresses([CURRENT_CHAIN_ADDRESS])
    const price = prices[CURRENT_CHAIN_ADDRESS] || '0'
    state.tokensPriceMap[CURRENT_CHAIN_ADDRESS] = price
    state.networkPrice = price
  },

  async getMyTokensWithBalance() {
    const res = await ConvertApiController.getMyTokensWithBalance()
    if (!res) {
      return
    }
    state.tokensPriceMap = Object.entries(res).reduce<Record<string, string>>(
      (prices, [tokenAddress, tokenInfo]) => {
        prices[tokenAddress] = tokenInfo.price
        return prices
      },
      {}
    )
    state.myTokensWithBalance = res
  },

  async searchTokens(searchTerm: string) {
    const response = await ConvertApiController.searchTokens(searchTerm)
  },

  calculateGasPriceInEther(gas: number, gasPrice: string) {
    const gasPriceNumber = BigInt(gasPrice)
    const totalGasCostInWei = gasPriceNumber * BigInt(gas)
    const totalGasCostInEther = Number(totalGasCostInWei) / 1e18

    return totalGasCostInEther
  },

  calculateGasPriceInUSD(gas: number, gasPrice: string) {
    try {
      const totalGasCostInEther = this.calculateGasPriceInEther(gas, gasPrice)
      const networkPriceNumber = parseFloat(state.networkPrice)
      const totalCostInUSD = totalGasCostInEther * networkPriceNumber

      return totalCostInUSD
    } catch (error) {
      return 0
    }
  },

  calculatePriceImpact(_toTokenAmount: string) {
    const sourceTokenAmount = parseFloat(state.sourceTokenAmount)
    const toTokenAmount = parseFloat(_toTokenAmount)
    const sourceTokenPrice = state.sourceTokenPriceInUSD
    const toTokenPrice = state.toTokenPriceInUSD

    const effectivePrice = (sourceTokenAmount * sourceTokenPrice) / toTokenAmount
    const priceImpact = ((effectivePrice - toTokenPrice) / toTokenPrice) * 100

    return priceImpact
  },

  calculateMaxSlippage() {
    const fromTokenAmount = parseFloat(state.sourceTokenAmount)
    const slippageToleranceDecimal = parseFloat(state.slippage) / 100
    const maxSlippageAmount = fromTokenAmount * slippageToleranceDecimal

    return maxSlippageAmount
  },

  // 1. Call convert token when amount is set
  async convertTokens() {
    const { sourceTokenAddress, toTokenAddress } = this.getParams()

    if (!sourceTokenAddress || !toTokenAddress) {
      return
    }

    state.convertLoading = true
    await this.makeChecks()
  },

  // 2. Make checks for allowance and convert if needed
  async makeChecks() {
    const {
      fromAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      sourceTokenDecimals,
      toTokenDecimals,
      toTokenAddress
    } = this.getParams()

    if (
      !sourceTokenAddress ||
      !sourceTokenAmount ||
      parseFloat(sourceTokenAmount) === 0 ||
      !sourceTokenDecimals ||
      !toTokenDecimals ||
      !toTokenAddress
    ) {
      return
    }

    state.loading = true
    const hasAllowance = await ConvertApiController.checkConvertAllowance({
      fromAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      sourceTokenDecimals
    })

    if (!hasAllowance) {
      const transaction = await this.createTokenAllowance()
      state.approvalTransaction = transaction
    } else {
      state.approvalTransaction = undefined
      const response = await this.createConvert()

      if (response.tx) {
        state.convertTransaction = response.tx
        this.setToTokenAmountValue(response.toAmount, toTokenDecimals, toTokenAddress)
        this.setTransactionDetails(response.tx.gas, response.tx.gasPrice)
      }
    }

    state.loading = false
  },

  // 3.1.1 Create token allowance
  async createTokenAllowance() {
    const { fromAddress, sourceTokenAddress } = this.getParams()

    if (!sourceTokenAddress) {
      throw new Error('>>> createTokenAllowance - No source token address found.')
    }

    state.loading = true
    const transaction = await ConvertApiController.getConvertApprovalData({
      sourceTokenAddress
    })

    const gasLimit = await ConnectionController.getEstimatedGas({
      ...transaction,
      from: fromAddress
    })

    return {
      ...transaction,
      gas: gasLimit
    }
  },

  // 3.1.2 Request approval for token
  async sendTransactionForApproval(data) {
    const { fromAddress } = this.getParams()
    state.transactionLoading = true

    try {
      await ConnectionController.sendTransaction({
        address: fromAddress,
        ...data
      })

      state.approvalTransaction = undefined
      state.transactionLoading = true
    } catch (error) {
      state.transactionError = error?.shortMessage
      state.transactionLoading = false
      SnackController.showError(error?.shortMessage || 'Transaction errror')
    }
  },

  // 3.2.1 Create convert
  async createConvert() {
    const {
      fromAddress,
      sourceTokenAddress,
      sourceTokenDecimals,
      sourceTokenAmount,
      toTokenAddress
    } = this.getParams()

    if (!sourceTokenAmount || !sourceTokenAddress || !toTokenAddress || !sourceTokenDecimals) {
      throw new Error('>>> createConvert: Invalid values to start converting')
    }

    return await ConvertApiController.getConvertData({
      fromAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      toTokenAddress,
      decimals: sourceTokenDecimals
    })
  },

  // 3.2.2 Send convert transaction
  async sendTransactionForConvert(data) {
    const { fromAddress } = this.getParams()

    state.transactionLoading = true
    try {
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress,
        to: data.to,
        data: data.data,
        gas: data.gas,
        gasPrice: BigInt(data.gasPrice),
        value: BigInt(data.value),
        chainId: CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
      })
      return transactionHash
    } catch (error) {
      state.transactionError = error?.shortMessage
      state.transactionLoading = false
      SnackController.showError(error?.shortMessage || 'Transaction errror')
      return undefined
    }
  },

  async setToTokenAmountValue(
    toTokenAmount: string,
    toTokenDecimals: number,
    toTokenAddress: string
  ) {
    if (!toTokenAddress || !toTokenAmount) {
      return
    }

    const amount = ConnectionController.formatUnits(BigInt(toTokenAmount), toTokenDecimals)
    const sourceTokenAmount = parseFloat(state.sourceTokenAmount)
    const sourceTokenPrice = state.sourceTokenPriceInUSD
    const toTokenPrice = parseFloat(state.tokensPriceMap[toTokenAddress] || '0')
    const toTokenAmountValue = (sourceTokenAmount * sourceTokenPrice) / toTokenPrice

    state.toTokenAmount = amount
    state.toTokenPriceInUSD = toTokenPrice
    state.toTokenAmount = toTokenAmountValue.toString()
  },

  async setTransactionDetails(gas: bigint, gasPrice: string) {
    const { toTokenAddress, toTokenAmount } = this.getParams()

    if (!toTokenAddress) {
      return
    }

    const toTokenPrice = state.tokensPriceMap[toTokenAddress] || '0'
    state.toTokenPriceInUSD = parseFloat(toTokenPrice)

    state.gasPriceInUSD = this.calculateGasPriceInUSD(Number(gas), gasPrice)
    state.priceImpact = this.calculatePriceImpact(toTokenAmount)
    state.maxSlippage = this.calculateMaxSlippage()
  }
}
