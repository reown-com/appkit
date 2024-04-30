import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AccountController, SwapController, type SwapTokenWithBalance } from '../../index.js'
import { prices, tokenInfo } from '../mocks/SwapController.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'

// - Mocks ---------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const sourceTokenAddress = 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const initialSourceToken = tokenInfo[0] as SwapTokenWithBalance
const initialToToken = tokenInfo[1] as SwapTokenWithBalance

// - Helpers
function setSourceTokenAmount(value: string, _toToken: SwapTokenWithBalance) {
  SwapController.setSourceTokenAmount(value)
  const toTokenAmount = SwapController.getToAmount()
  const toTokenValues = SwapController.getToTokenValues()
  SwapController.state.toTokenAmount = toTokenAmount
  SwapController.state.toTokenPriceInUSD = toTokenValues.toTokenPriceInUSD
}

function initializeSwapState(_sourceToken: SwapTokenWithBalance, _toToken: SwapTokenWithBalance) {
  SwapController.state.tokensPriceMap = prices
  SwapController.state.networkPrice = prices[sourceTokenAddress].toString()
  SwapController.state.networkBalanceInUSD = '2'
  SwapController.state.gasPriceInUSD = SwapController.calculateGasPriceInUSD(gasLimit, gasFee)
  SwapController.setSourceToken(_sourceToken)
  SwapController.state.sourceTokenPriceInUSD = _sourceToken.price
  SwapController.setToToken(_toToken)
}

// - Setup ---------------------------------------------------------------------
beforeAll(() => {
  AccountController.setCaipAddress(caipAddress)
})

beforeEach(() => {
  const sourceToken = tokenInfo[0] as SwapTokenWithBalance
  const toToken = tokenInfo[1] as SwapTokenWithBalance
  // User selected tokens
  initializeSwapState(sourceToken, toToken)
  // User input the amount of source token
  setSourceTokenAmount('1', toToken)
})

// -- Tests --------------------------------------------------------------------
describe('SwapController', () => {
  it('should set toToken as expected', () => {
    expect(SwapController.state.toToken?.address).toEqual(initialToToken.address)
  })

  it('should set sourceToken as expected', () => {
    expect(SwapController.state.sourceToken?.address).toEqual(initialSourceToken.address)
  })

  it('should calculate gas price in Ether and USD as expected', () => {
    const gasPriceInEther = SwapController.calculateGasPriceInEther(gasLimit, gasFee)
    const gasPriceInUSD = SwapController.calculateGasPriceInUSD(gasLimit, gasFee)

    expect(gasPriceInEther).toEqual(0.068395033074)
    expect(gasPriceInUSD).toEqual(0.06395499714651795)
  })

  it('should return insufficient balance as expected', () => {
    SwapController.state.networkBalanceInUSD = '0'
    expect(SwapController.isInsufficientNetworkTokenForGas()).toEqual(true)
  })

  it('should calculate swap values as expected', () => {
    expect(SwapController.state.toTokenAmount).toEqual('6.776562691884707218')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0.10315220553291868)
  })

  it('should calculate the price impact as expected', () => {
    const priceImpact = SwapController.calculatePriceImpact(
      SwapController.state.toTokenAmount,
      SwapController.calculateGasPriceInUSD(gasLimit, gasFee)
    )
    expect(priceImpact).equal(9.14927128867287)
  })

  it('should calculate the maximum slippage as expected', () => {
    const maxSlippage = SwapController.calculateMaxSlippage()
    expect(maxSlippage).toEqual(0.01)
  })

  it('should reset values as expected', () => {
    SwapController.resetValues()
    expect(SwapController.state.toToken).toEqual(undefined)
    expect(SwapController.state.toTokenAmount).toEqual('')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0)
  })

  it('should calculate toAmount with same decimals as expected', () => {
    const sourceToken = tokenInfo[0] as SwapTokenWithBalance
    const toToken = tokenInfo[1] as SwapTokenWithBalance
    // Selected tokens
    initializeSwapState(sourceToken, toToken)
    // User input the amount of source token
    setSourceTokenAmount('2', toToken)

    const toTokenAmount = SwapController.getToAmount()
    expect(toTokenAmount).toEqual('13.553125383769414436')
  })

  it('should calculate toAmount with different decimals as expected', () => {
    const sourceToken = tokenInfo[0] as SwapTokenWithBalance
    const toToken = tokenInfo[2] as SwapTokenWithBalance
    // Selected tokens
    initializeSwapState(sourceToken, toToken)
    // User input the amount of source token
    setSourceTokenAmount('2', toToken)

    const toTokenAmount = SwapController.getToAmount()
    expect(toTokenAmount).toEqual('1.398617')
  })

  it('should return insufficient balance for gas as expected', () => {
    const isInsufficientNetworkTokenForGas = SwapController.isInsufficientNetworkTokenForGas()
    expect(isInsufficientNetworkTokenForGas).toEqual(false)
  })

  it('should return insufficient balance for swap as expected', () => {
    const toToken = tokenInfo[2] as SwapTokenWithBalance
    setSourceTokenAmount('24', toToken)

    const isInsufficientSourceTokenForSwap = SwapController.isInsufficientSourceTokenForSwap()
    expect(isInsufficientSourceTokenForSwap).toEqual(true)
  })
})
