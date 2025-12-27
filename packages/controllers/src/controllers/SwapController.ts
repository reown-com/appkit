import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type Address, type CaipNetworkId, type Hex, NumberUtil } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { BalanceUtil } from '../utils/BalanceUtil.js'
import {
  getActiveNetworkTokenAddress,
  getPreferredAccountType
} from '../utils/ChainControllerUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import { SwapCalculationUtil } from '../utils/SwapCalculationUtil.js'
import type { SwapTokenWithBalance } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { AlertController } from './AlertController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { RouterController } from './RouterController.js'
import { SnackController } from './SnackController.js'

// -- Constants ---------------------------------------- //
export const INITIAL_GAS_LIMIT = 150000
export const TO_AMOUNT_DECIMALS = 6

// -- Types --------------------------------------------- //
export type SwapInputTarget = 'sourceToken' | 'toToken'

export type SwapInputArguments = Partial<{
  fromToken: string
  toToken: string
  amount: string
}>

type TransactionParams = {
  data: Hex
  to: Address
  gas?: bigint
  gasPrice?: bigint
  value: bigint
  toAmount: string
}

class TransactionError extends Error {
  displayMessage?: string

  constructor(message?: string, displayMessage?: string) {
    super(message)
    this.name = 'TransactionError'
    this.displayMessage = displayMessage
  }
}

export interface SwapControllerState {
  // Loading states
  initializing: boolean
  initialized: boolean
  loadingPrices: boolean
  loadingQuote?: boolean
  loadingApprovalTransaction?: boolean
  loadingBuildTransaction?: boolean
  loadingTransaction?: boolean

  // Control states
  switchingTokens: boolean

  // Error states
  fetchError: boolean

  // Approval & Swap transaction states
  approvalTransaction: TransactionParams | undefined
  swapTransaction: TransactionParams | undefined
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
  caipNetworkId?: CaipNetworkId
  tokens?: SwapTokenWithBalance[]
  tokensLoading?: boolean
  suggestedTokens?: SwapTokenWithBalance[]
  popularTokens?: SwapTokenWithBalance[]
  foundTokens?: SwapTokenWithBalance[]
  myTokensWithBalance?: SwapTokenWithBalance[]
  tokensPriceMap: Record<string, number>

  // Calculations
  gasFee: string
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
  loadingPrices: false,
  loadingQuote: false,
  loadingApprovalTransaction: false,
  loadingBuildTransaction: false,
  loadingTransaction: false,

  // Control states
  switchingTokens: false,

  // Error states
  fetchError: false,

  // Approval & Swap transaction states
  approvalTransaction: undefined,
  swapTransaction: undefined,
  transactionError: undefined,

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
  gasFee: '0',
  gasPriceInUSD: 0,
  priceImpact: undefined,
  maxSlippage: undefined,
  providerFee: undefined
}

const state = proxy<SwapControllerState>({ ...initialState })

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (newState: SwapControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  getParams() {
    const namespace = ChainController.state.activeChain
    const caipAddress =
      ChainController.getAccountData(namespace)?.caipAddress ??
      ChainController.state.activeCaipAddress
    const address = CoreHelperUtil.getPlainAddress(caipAddress)
    const networkAddress = getActiveNetworkTokenAddress()
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)

    if (!address) {
      throw new Error('No address found to swap the tokens from.')
    }

    const invalidToToken = !state.toToken?.address || !state.toToken?.decimals
    const invalidSourceToken =
      !state.sourceToken?.address ||
      !state.sourceToken?.decimals ||
      !NumberUtil.bigNumber(state.sourceTokenAmount).gt(0)
    const invalidSourceTokenAmount = !state.sourceTokenAmount

    return {
      networkAddress,
      fromAddress: address,
      fromCaipAddress: caipAddress,
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
        caipAddress && !invalidToToken && !invalidSourceToken && !invalidSourceTokenAmount,
      isAuthConnector: connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH
    }
  },

  async setSourceToken(sourceToken: SwapTokenWithBalance | undefined) {
    if (!sourceToken) {
      state.sourceToken = sourceToken
      state.sourceTokenAmount = ''
      state.sourceTokenPriceInUSD = 0

      return
    }

    state.sourceToken = sourceToken
    await SwapController.setTokenPrice(sourceToken.address, 'sourceToken')
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
    await SwapController.setTokenPrice(toToken.address, 'toToken')
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount ? NumberUtil.toFixed(amount, TO_AMOUNT_DECIMALS) : ''
  },

  async setTokenPrice(address: string, target: SwapInputTarget) {
    let price = state.tokensPriceMap[address] || 0

    if (!price) {
      state.loadingPrices = true
      price = await SwapController.getAddressPrice(address)
    }

    if (target === 'sourceToken') {
      state.sourceTokenPriceInUSD = price
    } else if (target === 'toToken') {
      state.toTokenPriceInUSD = price
    }

    if (state.loadingPrices) {
      state.loadingPrices = false
    }

    if (SwapController.getParams().availableToSwap && !state.switchingTokens) {
      SwapController.swapTokens()
    }
  },

  async switchTokens() {
    if (state.initializing || !state.initialized || state.switchingTokens) {
      return
    }

    state.switchingTokens = true

    try {
      const newSourceToken = state.toToken ? { ...state.toToken } : undefined
      const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined
      const newSourceTokenAmount =
        newSourceToken && state.toTokenAmount === '' ? '1' : state.toTokenAmount

      SwapController.setSourceTokenAmount(newSourceTokenAmount)
      SwapController.setToTokenAmount('')

      await SwapController.setSourceToken(newSourceToken)
      await SwapController.setToToken(newToToken)

      state.switchingTokens = false

      SwapController.swapTokens()
    } catch (error) {
      state.switchingTokens = false
      throw error
    }
  },

  resetState() {
    state.myTokensWithBalance = initialState.myTokensWithBalance
    state.tokensPriceMap = initialState.tokensPriceMap
    state.initialized = initialState.initialized
    state.initializing = initialState.initializing
    state.switchingTokens = initialState.switchingTokens
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
    const { networkAddress } = SwapController.getParams()

    const networkToken = state.tokens?.find(token => token.address === networkAddress)
    SwapController.setSourceToken(networkToken)
    SwapController.setToToken(undefined)
  },

  getApprovalLoadingState() {
    return state.loadingApprovalTransaction
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
        await SwapController.fetchTokens()
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
    const { networkAddress } = SwapController.getParams()

    await SwapController.getNetworkTokenPrice()
    await SwapController.getMyTokensWithBalance()

    const networkToken = state.myTokensWithBalance?.find(token => token.address === networkAddress)

    if (networkToken) {
      state.networkTokenSymbol = networkToken.symbol
      SwapController.setSourceToken(networkToken)
      SwapController.setSourceTokenAmount('0')
    }
  },

  async getTokenList() {
    const activeCaipNetworkId = ChainController.state.activeCaipNetwork?.caipNetworkId

    if (state.caipNetworkId === activeCaipNetworkId && state.tokens) {
      return
    }

    try {
      state.tokensLoading = true
      const tokens = await SwapApiUtil.getTokenList(activeCaipNetworkId)

      state.tokens = tokens
      state.caipNetworkId = activeCaipNetworkId
      state.popularTokens = tokens.sort((aTokenInfo, bTokenInfo) => {
        if (aTokenInfo.symbol < bTokenInfo.symbol) {
          return -1
        }
        if (aTokenInfo.symbol > bTokenInfo.symbol) {
          return 1
        }

        return 0
      })

      const suggestedTokensByChain =
        (activeCaipNetworkId &&
          (ConstantsUtil.SUGGESTED_TOKENS_BY_CHAIN as Record<string, string[]>)?.[
            activeCaipNetworkId
          ]) ||
        []
      const suggestedTokenObjects = suggestedTokensByChain
        .map(symbol => tokens.find(t => t.symbol === symbol))
        .filter((t): t is SwapTokenWithBalance => Boolean(t))

      const allSuggestedTokens = ConstantsUtil.SWAP_SUGGESTED_TOKENS || []
      const allSuggestedTokenObjects = allSuggestedTokens
        .map(symbol => tokens.find(t => t.symbol === symbol))
        .filter((t): t is SwapTokenWithBalance => Boolean(t))
        .filter(t => !suggestedTokenObjects.some(ct => ct.address === t.address))

      state.suggestedTokens = [...suggestedTokenObjects, ...allSuggestedTokenObjects]
    } catch (error) {
      state.tokens = []
      state.popularTokens = []
      state.suggestedTokens = []
    } finally {
      state.tokensLoading = false
    }
  },

  async getAddressPrice(address: string) {
    const existPrice = state.tokensPriceMap[address]

    if (existPrice) {
      return existPrice
    }

    const response = await BlockchainApiController.fetchTokenPrice({
      addresses: [address]
    })
    const fungibles = response?.fungibles || []
    const allTokens = [...(state.tokens || []), ...(state.myTokensWithBalance || [])]
    const symbol = allTokens?.find(token => token.address === address)?.symbol
    const price = fungibles.find(p => p.symbol.toLowerCase() === symbol?.toLowerCase())?.price || 0
    const priceAsFloat = parseFloat(price.toString())

    state.tokensPriceMap[address] = priceAsFloat

    return priceAsFloat
  },

  async getNetworkTokenPrice() {
    const { networkAddress } = SwapController.getParams()

    const response = await BlockchainApiController.fetchTokenPrice({
      addresses: [networkAddress]
    }).catch(() => {
      SnackController.showError('Failed to fetch network token price')

      return { fungibles: [] }
    })
    const token = response.fungibles?.[0]
    const price = token?.price.toString() || '0'
    state.tokensPriceMap[networkAddress] = parseFloat(price)
    state.networkTokenSymbol = token?.symbol || ''
    state.networkPrice = price
  },

  async getMyTokensWithBalance(forceUpdate?: string) {
    const balances = await BalanceUtil.getMyTokensWithBalance({
      forceUpdate,
      caipNetwork: ChainController.state.activeCaipNetwork,
      address: ChainController.getAccountData()?.address
    })
    const swapBalances = SwapApiUtil.mapBalancesToSwapTokens(balances)

    if (!swapBalances) {
      return
    }

    await SwapController.getInitialGasPrice()
    SwapController.setBalances(swapBalances)
  },

  setBalances(balances: SwapTokenWithBalance[]) {
    const { networkAddress } = SwapController.getParams()
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!caipNetwork) {
      return
    }

    const networkToken = balances.find(token => token.address === networkAddress)

    balances.forEach(token => {
      state.tokensPriceMap[token.address] = token.price || 0
    })
    state.myTokensWithBalance = balances.filter(token =>
      token.address.startsWith(caipNetwork.caipNetworkId)
    )
    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
      : '0'
  },

  async getInitialGasPrice() {
    const res = await SwapApiUtil.fetchGasPrice()

    if (!res) {
      return { gasPrice: null, gasPriceInUSD: null }
    }

    switch (ChainController.state?.activeCaipNetwork?.chainNamespace) {
      case CommonConstantsUtil.CHAIN.SOLANA:
        state.gasFee = res.standard ?? '0'
        state.gasPriceInUSD = NumberUtil.multiply(res.standard, state.networkPrice)
          .div(1e9)
          .toNumber()

        return {
          gasPrice: BigInt(state.gasFee),
          gasPriceInUSD: Number(state.gasPriceInUSD)
        }

      case CommonConstantsUtil.CHAIN.EVM:
      default:
        // eslint-disable-next-line no-case-declarations
        const value = res.standard ?? '0'
        // eslint-disable-next-line no-case-declarations
        const gasFee = BigInt(value)
        // eslint-disable-next-line no-case-declarations
        const gasLimit = BigInt(INITIAL_GAS_LIMIT)
        // eslint-disable-next-line no-case-declarations
        const gasPrice = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gasLimit, gasFee)

        state.gasFee = value
        state.gasPriceInUSD = gasPrice

        return { gasPrice: gasFee, gasPriceInUSD: gasPrice }
    }
  },

  // -- Swap -------------------------------------- //
  async swapTokens() {
    const address = ChainController.getAccountData()?.address
    const sourceToken = state.sourceToken
    const toToken = state.toToken
    const haveSourceTokenAmount = NumberUtil.bigNumber(state.sourceTokenAmount).gt(0)

    if (!haveSourceTokenAmount) {
      SwapController.setToTokenAmount('')
    }

    if (!toToken || !sourceToken || state.loadingPrices || !haveSourceTokenAmount || !address) {
      return
    }

    state.loadingQuote = true

    const amountDecimal = NumberUtil.bigNumber(state.sourceTokenAmount)
      .times(10 ** sourceToken.decimals)
      .round(0)

    try {
      const quoteResponse = await BlockchainApiController.fetchSwapQuote({
        userAddress: address,
        from: sourceToken.address,
        to: toToken.address,
        gasPrice: state.gasFee,
        amount: amountDecimal.toString()
      })

      state.loadingQuote = false

      const quoteToAmount = quoteResponse?.quotes?.[0]?.toAmount

      if (!quoteToAmount) {
        AlertController.open(
          {
            displayMessage: 'Incorrect amount',
            debugMessage: 'Please enter a valid amount'
          },
          'error'
        )

        return
      }

      const toTokenAmount = NumberUtil.bigNumber(quoteToAmount)
        .div(10 ** toToken.decimals)
        .toString()

      SwapController.setToTokenAmount(toTokenAmount)

      const isInsufficientToken = SwapController.hasInsufficientToken(
        state.sourceTokenAmount,
        sourceToken.address
      )

      if (isInsufficientToken) {
        state.inputError = 'Insufficient balance'
      } else {
        state.inputError = undefined
        SwapController.setTransactionDetails()
      }
    } catch (error) {
      const response = await SwapApiUtil.handleSwapError(error)
      state.loadingQuote = false
      state.inputError = response || 'Insufficient balance'
    }
  },

  // -- Create Transactions -------------------------------------- //
  async getTransaction() {
    const { fromCaipAddress, availableToSwap } = SwapController.getParams()
    const sourceToken = state.sourceToken
    const toToken = state.toToken

    if (!fromCaipAddress || !availableToSwap || !sourceToken || !toToken || state.loadingQuote) {
      return undefined
    }

    try {
      state.loadingBuildTransaction = true
      const hasAllowance = await SwapApiUtil.fetchSwapAllowance({
        userAddress: fromCaipAddress,
        tokenAddress: sourceToken.address,
        sourceTokenAmount: state.sourceTokenAmount,
        sourceTokenDecimals: sourceToken.decimals
      })

      let transaction: TransactionParams | undefined = undefined

      if (hasAllowance) {
        transaction = await SwapController.createSwapTransaction()
      } else {
        transaction = await SwapController.createAllowanceTransaction()
      }

      state.loadingBuildTransaction = false
      state.fetchError = false

      return transaction
    } catch (error) {
      RouterController.goBack()
      SnackController.showError('Failed to check allowance')
      state.loadingBuildTransaction = false
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true

      return undefined
    }
  },

  async createAllowanceTransaction() {
    const { fromCaipAddress, sourceTokenAddress, toTokenAddress } = SwapController.getParams()

    if (!fromCaipAddress || !toTokenAddress) {
      return undefined
    }

    if (!sourceTokenAddress) {
      throw new Error('createAllowanceTransaction - No source token address found.')
    }

    try {
      const response = await BlockchainApiController.generateApproveCalldata({
        from: sourceTokenAddress,
        to: toTokenAddress,
        userAddress: fromCaipAddress
      })
      const address = CoreHelperUtil.getPlainAddress(response.tx.from)

      if (!address) {
        throw new Error('SwapController:createAllowanceTransaction - address is required')
      }

      const transaction = {
        data: response.tx.data,
        to: address,
        gasPrice: BigInt(response.tx.eip155.gasPrice),
        value: BigInt(response.tx.value),
        toAmount: state.toTokenAmount
      }

      state.swapTransaction = undefined
      state.approvalTransaction = {
        data: transaction.data,
        to: transaction.to,
        gasPrice: transaction.gasPrice,
        value: transaction.value,
        toAmount: transaction.toAmount
      }

      return {
        data: transaction.data,
        to: transaction.to,
        gasPrice: transaction.gasPrice,
        value: transaction.value,
        toAmount: transaction.toAmount
      }
    } catch (error) {
      RouterController.goBack()
      SnackController.showError('Failed to create approval transaction')
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true

      return undefined
    }
  },

  async createSwapTransaction() {
    const { networkAddress, fromCaipAddress, sourceTokenAmount } = SwapController.getParams()
    const sourceToken = state.sourceToken
    const toToken = state.toToken

    if (!fromCaipAddress || !sourceTokenAmount || !sourceToken || !toToken) {
      return undefined
    }

    const amount = ConnectionController.parseUnits(
      sourceTokenAmount,
      sourceToken.decimals
    )?.toString()

    try {
      const response = await BlockchainApiController.generateSwapCalldata({
        userAddress: fromCaipAddress,
        from: sourceToken.address,
        to: toToken.address,
        amount: amount as string,
        disableEstimate: true
      })

      const isSourceTokenIsNetworkToken = sourceToken.address === networkAddress

      const gas = BigInt(response.tx.eip155.gas)
      const gasPrice = BigInt(response.tx.eip155.gasPrice)
      const address = CoreHelperUtil.getPlainAddress(response.tx.to)

      if (!address) {
        throw new Error('SwapController:createSwapTransaction - address is required')
      }

      const transaction = {
        data: response.tx.data,
        to: address,
        gas,
        gasPrice,
        value: isSourceTokenIsNetworkToken ? BigInt(amount ?? '0') : BigInt('0'),
        toAmount: state.toTokenAmount
      }

      state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gas, gasPrice)
      state.approvalTransaction = undefined
      state.swapTransaction = transaction

      return transaction
    } catch (error) {
      RouterController.goBack()
      SnackController.showError('Failed to create transaction')
      state.approvalTransaction = undefined
      state.swapTransaction = undefined
      state.fetchError = true

      return undefined
    }
  },

  onEmbeddedWalletApprovalSuccess() {
    SnackController.showLoading('Approve limit increase in your wallet')
    RouterController.replace('SwapPreview')
  },

  // -- Send Transactions --------------------------------- //
  async sendTransactionForApproval(data: TransactionParams) {
    const { fromAddress, isAuthConnector } = SwapController.getParams()

    state.loadingApprovalTransaction = true
    const approveLimitMessage = `Approve limit increase in your wallet`

    if (isAuthConnector) {
      RouterController.pushTransactionStack({
        onSuccess: SwapController.onEmbeddedWalletApprovalSuccess
      })
    } else {
      SnackController.showLoading(approveLimitMessage)
    }

    try {
      await ConnectionController.sendTransaction({
        address: fromAddress,
        to: data.to,
        data: data.data,
        value: data.value,
        chainNamespace: CommonConstantsUtil.CHAIN.EVM
      })

      await SwapController.swapTokens()
      await SwapController.getTransaction()
      state.approvalTransaction = undefined
      state.loadingApprovalTransaction = false
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.displayMessage as unknown as string
      state.loadingApprovalTransaction = false
      SnackController.showError(error?.displayMessage || 'Transaction error')
      EventsController.sendEvent({
        type: 'track',
        event: 'SWAP_APPROVAL_ERROR',
        properties: {
          message: error?.displayMessage || error?.message || 'Unknown',
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
          swapFromToken: SwapController.state.sourceToken?.symbol || '',
          swapToToken: SwapController.state.toToken?.symbol || '',
          swapFromAmount: SwapController.state.sourceTokenAmount || '',
          swapToAmount: SwapController.state.toTokenAmount || '',
          isSmartAccount:
            getPreferredAccountType(CommonConstantsUtil.CHAIN.EVM) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })
    }
  },

  async sendTransactionForSwap(data: TransactionParams | undefined) {
    if (!data) {
      return undefined
    }

    const { fromAddress, toTokenAmount, isAuthConnector } = SwapController.getParams()

    state.loadingTransaction = true

    const snackbarPendingMessage = `Swapping ${
      state.sourceToken?.symbol
    } to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken?.symbol}`
    const snackbarSuccessMessage = `Swapped ${
      state.sourceToken?.symbol
    } to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken?.symbol}`

    if (isAuthConnector) {
      RouterController.pushTransactionStack({
        onSuccess() {
          RouterController.replace('Account')
          SnackController.showLoading(snackbarPendingMessage)
          controller.resetState()
        }
      })
    } else {
      SnackController.showLoading('Confirm transaction in your wallet')
    }

    try {
      const forceUpdateAddresses = [state.sourceToken?.address, state.toToken?.address].join(',')
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress,
        to: data.to,
        data: data.data,
        value: data.value,
        chainNamespace: CommonConstantsUtil.CHAIN.EVM
      })

      state.loadingTransaction = false
      SnackController.showSuccess(snackbarSuccessMessage)
      EventsController.sendEvent({
        type: 'track',
        event: 'SWAP_SUCCESS',
        properties: {
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
          swapFromToken: SwapController.state.sourceToken?.symbol || '',
          swapToToken: SwapController.state.toToken?.symbol || '',
          swapFromAmount: SwapController.state.sourceTokenAmount || '',
          swapToAmount: SwapController.state.toTokenAmount || '',
          isSmartAccount:
            getPreferredAccountType(CommonConstantsUtil.CHAIN.EVM) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })
      controller.resetState()
      if (!isAuthConnector) {
        RouterController.replace('Account')
      }
      controller.getMyTokensWithBalance(forceUpdateAddresses)

      return transactionHash
    } catch (err) {
      const error = err as TransactionError
      state.transactionError = error?.displayMessage
      state.loadingTransaction = false
      SnackController.showError(error?.displayMessage || 'Transaction error')
      EventsController.sendEvent({
        type: 'track',
        event: 'SWAP_ERROR',
        properties: {
          message: error?.displayMessage || error?.message || 'Unknown',
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
          swapFromToken: SwapController.state.sourceToken?.symbol || '',
          swapToToken: SwapController.state.toToken?.symbol || '',
          swapFromAmount: SwapController.state.sourceTokenAmount || '',
          swapToAmount: SwapController.state.toTokenAmount || '',
          isSmartAccount:
            getPreferredAccountType(CommonConstantsUtil.CHAIN.EVM) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })

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

    return isInsufficientSourceTokenForSwap
  },

  // -- Calculations -------------------------------------- //
  setTransactionDetails() {
    const { toTokenAddress, toTokenDecimals } = SwapController.getParams()

    if (!toTokenAddress || !toTokenDecimals) {
      return
    }

    state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(
      state.networkPrice,
      BigInt(state.gasFee),
      BigInt(INITIAL_GAS_LIMIT)
    )
    state.priceImpact = SwapCalculationUtil.getPriceImpact({
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenPriceInUSD: state.sourceTokenPriceInUSD,
      toTokenPriceInUSD: state.toTokenPriceInUSD,
      toTokenAmount: state.toTokenAmount
    })
    state.maxSlippage = SwapCalculationUtil.getMaxSlippage(state.slippage, state.toTokenAmount)
    state.providerFee = SwapCalculationUtil.getProviderFee(state.sourceTokenAmount)
  }
}

// Export the controller wrapped with our error boundary
export const SwapController = withErrorBoundary(controller)
