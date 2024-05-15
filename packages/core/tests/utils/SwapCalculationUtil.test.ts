import { describe, expect, it } from 'vitest'
import { SwapCalculationUtil } from '../../src/utils/SwapCalculationUtil.js'
import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'
import { networkTokenPriceResponse, tokensResponse } from '../mocks/SwapController.js'
import type { SwapTokenWithBalance } from '../../src/utils/TypeUtil.js'
import { NumberUtil } from '@web3modal/common'

// - Mocks ---------------------------------------------------------------------
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const sourceToken = tokensResponse[0] as SwapTokenWithBalance
const sourceTokenAmount = '1'
const toToken = tokensResponse[1] as SwapTokenWithBalance

const networkPrice = networkTokenPriceResponse.fungibles[0]?.price || '0'

// -- Tests --------------------------------------------------------------------
describe('SwapCalculationUtil', () => {
  it('should get gas price in Ether and USD as expected', () => {
    const gasPriceInEther = SwapCalculationUtil.getGasPriceInEther(gasLimit, gasFee)
    const gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(networkPrice, gasLimit, gasFee)

    expect(gasPriceInEther).toEqual(0.068395033074)
    expect(gasPriceInUSD).toEqual(0.04780931734420308)
  })

  it('should return insufficient balance as expected', () => {
    expect(SwapCalculationUtil.isInsufficientNetworkTokenForGas('0', 0.01)).toEqual(true)
  })

  it('should return insufficient balance for gas as expected', () => {
    const gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(networkPrice, gasLimit, gasFee)
    const networkBalanceInUSD = NumberUtil.multiply(
      sourceToken.quantity.numeric,
      sourceToken.price
    ).toString()

    expect(
      SwapCalculationUtil.isInsufficientNetworkTokenForGas(networkBalanceInUSD, gasPriceInUSD)
    ).toEqual(false)
  })

  it('should get the price impact as expected', () => {
    const gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(networkPrice, gasLimit, gasFee)
    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken,
      toTokenPrice: toToken.price
    })

    const priceImpact = SwapCalculationUtil.getPriceImpact({
      gasPriceInUSD,
      sourceTokenAmount,
      sourceTokenPriceInUSD: sourceToken.price,
      toTokenAmount,
      toTokenPriceInUSD: toToken.price
    })
    expect(priceImpact).equal(7.755424414926879)
  })

  it('should get to token amount with same decimals including provider fee as expected', () => {
    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken,
      toTokenPrice: toToken.price
    })
    expect(toTokenAmount).equal('6.718961909003687207')
  })

  it('should get to token amount with different decimals including provider fee as expected', () => {
    const newToToken = tokensResponse[2] as SwapTokenWithBalance

    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken: newToToken,
      toTokenPrice: newToToken.price
    })
    expect(toTokenAmount).equal('0.693364')
  })

  it('should calculate the maximum slippage as expected', () => {
    const maxSlippage = SwapCalculationUtil.getMaxSlippage(1, '1')
    expect(maxSlippage).toEqual(0.01)
  })

  it('should calculate the provider fee as expected', () => {
    const providerFee = SwapCalculationUtil.getProviderFee(sourceTokenAmount)
    expect(providerFee).toEqual('0.0085')
  })
})
