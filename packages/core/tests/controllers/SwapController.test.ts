import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AccountController, SwapController, type SwapTokenWithBalance } from '../../index.js'
import { prices, tokenInfo } from '../mocks/SwapController.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'
import { SwapCalculationUtil } from '../../src/utils/SwapCalculationUtil.js'

// - Mocks ---------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const networkTokenAddress = 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// MATIC
const networkToken = tokenInfo[0] as SwapTokenWithBalance
// FOX
const toToken = tokenInfo[1] as SwapTokenWithBalance

// - Helpers
function initializeSwapState(_sourceToken: SwapTokenWithBalance, _toToken: SwapTokenWithBalance) {
  SwapController.state.tokensPriceMap = prices
  SwapController.state.networkPrice = prices[networkTokenAddress].toString()
  SwapController.state.networkBalanceInUSD = networkToken.quantity.numeric
  SwapController.state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(
    SwapController.state.networkPrice,
    gasLimit,
    gasFee
  )
  SwapController.setSourceToken(_sourceToken)
  SwapController.state.sourceTokenPriceInUSD = _sourceToken.price
  SwapController.setToToken(_toToken)
  SwapController.state.toTokenPriceInUSD = _toToken.price
  SwapController.state.toTokenAmount = SwapCalculationUtil.getToTokenAmount({
    sourceToken: _sourceToken,
    sourceTokenAmount: '1',
    sourceTokenPrice: _sourceToken.price,
    toToken: _toToken,
    toTokenPrice: _toToken.price
  })
}

// - Setup ---------------------------------------------------------------------
beforeAll(() => {
  AccountController.setCaipAddress(caipAddress)
})

beforeEach(() => {
  initializeSwapState(networkToken, toToken)
})

// -- Tests --------------------------------------------------------------------
describe('SwapController', () => {
  it('should set sourceToken as expected', () => {
    expect(SwapController.state.sourceToken?.address).toEqual(networkToken.address)
  })

  it('should set toToken as expected', () => {
    expect(SwapController.state.toToken?.address).toEqual(toToken.address)
  })

  it('should calculate swap values as expected', () => {
    expect(SwapController.state.toTokenAmount).toEqual('6.725738471695571914')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0.10315220553291868)
  })

  it('should reset values as expected', () => {
    SwapController.resetValues()
    expect(SwapController.state.toToken).toEqual(undefined)
    expect(SwapController.state.toTokenAmount).toEqual('')
    expect(SwapController.state.toTokenPriceInUSD).toEqual(0)
  })
})
