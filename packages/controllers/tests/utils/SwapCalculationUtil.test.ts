import { describe, expect, it } from 'vitest'

import { NumberUtil } from '@reown/appkit-common'

import { INITIAL_GAS_LIMIT } from '../../src/controllers/SwapController.js'
import { SwapApiUtil } from '../../src/utils/SwapApiUtil.js'
import { SwapCalculationUtil } from '../../src/utils/SwapCalculationUtil.js'
import type { SwapTokenWithBalance } from '../../src/utils/TypeUtil.js'
import { balanceResponse, networkTokenPriceResponse } from '../mocks/SwapController.js'

// - Mocks ---------------------------------------------------------------------
const gasLimit = BigInt(INITIAL_GAS_LIMIT)
const gasFee = BigInt(455966887160)

const tokensWithBalance = SwapApiUtil.mapBalancesToSwapTokens(balanceResponse.balances)

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const sourceToken = tokensWithBalance[0] as SwapTokenWithBalance
const sourceTokenAmount = '1'
// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const toToken = tokensWithBalance[1] as SwapTokenWithBalance

const networkPrice = networkTokenPriceResponse.fungibles[0]?.price.toString() || '0'

// -- Tests --------------------------------------------------------------------
describe('SwapCalculationUtil', () => {
  it('should get gas price in Ether and USD as expected', () => {
    const gasPriceInEther = SwapCalculationUtil.getGasPriceInEther(gasLimit, gasFee)
    const gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(networkPrice, gasLimit, gasFee)

    expect(gasPriceInEther).toEqual(0.068395033074)
    expect(gasPriceInUSD).toEqual(0.0492923003364318)
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
    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken,
      toTokenPrice: toToken.price
    })

    const priceImpact = SwapCalculationUtil.getPriceImpact({
      sourceTokenAmount,
      sourceTokenPriceInUSD: sourceToken.price,
      toTokenAmount,
      toTokenPriceInUSD: toToken.price
    })
    expect(priceImpact).equal(0.8499999999999975)
  })

  it('should get to token amount with same decimals including provider fee as expected', () => {
    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken,
      toTokenPrice: toToken.price
    })
    expect(toTokenAmount).equal('0.017817571677266286')
  })

  it('should get to token amount with different decimals including provider fee as expected', () => {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const newToToken = tokensWithBalance[2] as SwapTokenWithBalance

    const toTokenAmount = SwapCalculationUtil.getToTokenAmount({
      sourceToken,
      sourceTokenAmount,
      sourceTokenPrice: sourceToken.price,
      toToken: newToToken,
      toTokenPrice: newToToken.price
    })
    expect(toTokenAmount).equal('0.714549')
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
