import { beforeAll, describe, expect, it } from 'vitest'
import { AccountController, ConvertController } from '../../index.js'
import { prices, tokenInfo } from '../mocks/ConvertController.js'
import type { TokenInfo } from '../../src/utils/ConvertApiUtil.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/ConvertController.js'

// - Mocks ---------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const sourceTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const toTokenAddress = '0xb33eaad8d922b1083446dc23f610c2567fb5180f'

const sourceToken = tokenInfo[sourceTokenAddress] as TokenInfo
const toToken = tokenInfo[toTokenAddress] as TokenInfo

// - Helpers
function setSourceTokenAmount(value: string) {
  ConvertController.setSourceTokenAmount(value)
  const toTokenAmount = ConvertController.getToAmount()
  const toTokenValues = ConvertController.getToTokenValues(toTokenAmount, toToken.decimals)
  ConvertController.state.toTokenAmount = toTokenValues.toTokenAmount
  ConvertController.state.toTokenPriceInUSD = toTokenValues.toTokenPriceInUSD
}

// - Setup ---------------------------------------------------------------------
beforeAll(() => {
  AccountController.setCaipAddress(caipAddress)
  ConvertController.state.tokensPriceMap = prices
  ConvertController.state.networkPrice = prices[sourceTokenAddress]
  ConvertController.state.networkBalanceInUSD = '2'
  ConvertController.state.gasPriceInUSD = ConvertController.calculateGasPriceInUSD(gasLimit, gasFee)
  ConvertController.setSourceToken(sourceToken)
  ConvertController.setToToken(toToken)
  setSourceTokenAmount('1')
})

// -- Tests --------------------------------------------------------------------
describe('ConvertController', () => {
  it('should set toToken as expected', () => {
    expect(ConvertController.state.toToken?.address).toEqual(toToken.address)
  })

  it('should set sourceToken as expected', () => {
    expect(ConvertController.state.sourceToken?.address).toEqual(sourceToken.address)
  })

  it('should calculate gas price in Ether and USD as expected', async () => {
    const gasPriceInEther = ConvertController.calculateGasPriceInEther(gasLimit, gasFee)
    const gasPriceInUSD = ConvertController.calculateGasPriceInUSD(gasLimit, gasFee)

    expect(gasPriceInEther).toEqual(0.068395033074)
    expect(gasPriceInUSD).toEqual(0.06395499714651795)
  })

  it('should return insufficient balance as expected', async () => {
    ConvertController.state.networkBalanceInUSD = '0'
    expect(ConvertController.isInsufficientNetworkTokenForGas()).toEqual(true)
  })

  it('should calculate convert values as expected', async () => {
    expect(ConvertController.state.toTokenAmount).toEqual('0.07942958313582482619')
    expect(ConvertController.state.toTokenPriceInUSD).toEqual(11.772471201328177)
  })

  it('should calculate the price impact as expected', async () => {
    const priceImpact = ConvertController.calculatePriceImpact(
      ConvertController.state.toTokenAmount,
      ConvertController.calculateGasPriceInUSD(gasLimit, gasFee)
    )
    expect(priceImpact).equal(6.839503307400001)
  })

  it('should calculate the maximum slippage as expected', async () => {
    const maxSlippage = ConvertController.calculateMaxSlippage()
    expect(maxSlippage).toEqual(0.005)
  })
})
