import { beforeAll, describe, expect, it } from 'vitest'
import { AccountController, SwapController, type SwapTokenWithBalance } from '../../index.js'
import { prices, tokenInfo } from '../mocks/SwapController.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'

// - Mocks ---------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const sourceTokenAddress = 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const sourceToken = tokenInfo[0] as SwapTokenWithBalance
const toToken = tokenInfo[1] as SwapTokenWithBalance

// - Helpers
function setSourceTokenAmount(value: string) {
  SwapController.setSourceTokenAmount(value)
  const toTokenAmount = SwapController.getToAmount()
  const toTokenValues = SwapController.getToTokenValues(toTokenAmount, toToken?.decimals)
  SwapController.state.toTokenAmount = toTokenValues.toTokenAmount
  SwapController.state.toTokenPriceInUSD = toTokenValues.toTokenPriceInUSD
}

// - Setup ---------------------------------------------------------------------
beforeAll(() => {
  AccountController.setCaipAddress(caipAddress)
  SwapController.state.tokensPriceMap = prices
  SwapController.state.networkPrice = prices[sourceTokenAddress].toString()
  SwapController.state.networkBalanceInUSD = '2'
  SwapController.state.gasPriceInUSD = SwapController.calculateGasPriceInUSD(gasLimit, gasFee)
  SwapController.setSourceToken(sourceToken)
  SwapController.state.sourceTokenPriceInUSD = sourceToken.price
  SwapController.setToToken(toToken)
  setSourceTokenAmount('1')
})

// -- Tests --------------------------------------------------------------------
describe('SwapController', () => {
  it('should set toToken as expected', () => {
    expect(SwapController.state.toToken?.address).toEqual(toToken.address)
  })

  it('should set sourceToken as expected', () => {
    expect(SwapController.state.sourceToken?.address).toEqual(sourceToken.address)
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
    expect(SwapController.state.toTokenAmount).toEqual('6.77656269188470721788')
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
})
