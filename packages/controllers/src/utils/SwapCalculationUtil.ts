// -- Types --------------------------------------------- //
import { NumberUtil } from '@reown/appkit-common'

import type { SwapTokenWithBalance } from './TypeUtil.js'

// -- Util ---------------------------------------- //
export const SwapCalculationUtil = {
  getGasPriceInEther(gas: bigint, gasPrice: bigint) {
    const totalGasCostInWei = gasPrice * gas
    const totalGasCostInEther = Number(totalGasCostInWei) / 1e18

    return totalGasCostInEther
  },

  getGasPriceInUSD(networkPrice: string, gas: bigint, gasPrice: bigint) {
    const totalGasCostInEther = SwapCalculationUtil.getGasPriceInEther(gas, gasPrice)
    const networkPriceInUSD = NumberUtil.bigNumber(networkPrice)
    const gasCostInUSD = networkPriceInUSD.times(totalGasCostInEther)

    return gasCostInUSD.toNumber()
  },

  getPriceImpact({
    sourceTokenAmount,
    sourceTokenPriceInUSD,
    toTokenPriceInUSD,
    toTokenAmount
  }: {
    sourceTokenAmount: string
    sourceTokenPriceInUSD: number
    toTokenPriceInUSD: number
    toTokenAmount: string
  }) {
    const inputValue = NumberUtil.bigNumber(sourceTokenAmount).times(sourceTokenPriceInUSD)
    const outputValue = NumberUtil.bigNumber(toTokenAmount).times(toTokenPriceInUSD)
    const priceImpact = inputValue.minus(outputValue).div(inputValue).times(100)

    return priceImpact.toNumber()
  },

  getMaxSlippage(slippage: number, toTokenAmount: string) {
    const slippageToleranceDecimal = NumberUtil.bigNumber(slippage).div(100)
    const maxSlippageAmount = NumberUtil.multiply(toTokenAmount, slippageToleranceDecimal)

    return maxSlippageAmount.toNumber()
  },

  getProviderFee(sourceTokenAmount: string, feePercentage = 0.0085) {
    const providerFee = NumberUtil.bigNumber(sourceTokenAmount).times(feePercentage)

    return providerFee.toString()
  },

  isInsufficientNetworkTokenForGas(networkBalanceInUSD: string, gasPriceInUSD: number | undefined) {
    const gasPrice = gasPriceInUSD || '0'

    if (NumberUtil.bigNumber(networkBalanceInUSD).eq(0)) {
      return true
    }

    return NumberUtil.bigNumber(NumberUtil.bigNumber(gasPrice)).gt(networkBalanceInUSD)
  },

  isInsufficientSourceTokenForSwap(
    sourceTokenAmount: string,
    sourceTokenAddress: string,
    balance: SwapTokenWithBalance[] | undefined
  ) {
    const sourceTokenBalance = balance?.find(token => token.address === sourceTokenAddress)
      ?.quantity?.numeric

    const isInSufficientBalance = NumberUtil.bigNumber(sourceTokenBalance || '0').lt(
      sourceTokenAmount
    )

    return isInSufficientBalance
  },

  getToTokenAmount({
    sourceToken,
    toToken,
    sourceTokenPrice,
    toTokenPrice,
    sourceTokenAmount
  }: {
    sourceToken: SwapTokenWithBalance | undefined
    toToken: SwapTokenWithBalance | undefined
    sourceTokenPrice: number
    toTokenPrice: number
    sourceTokenAmount: string
  }) {
    if (sourceTokenAmount === '0') {
      return '0'
    }

    if (!sourceToken || !toToken) {
      return '0'
    }

    const sourceTokenDecimals = sourceToken.decimals
    const sourceTokenPriceInUSD = sourceTokenPrice
    const toTokenDecimals = toToken.decimals
    const toTokenPriceInUSD = toTokenPrice

    if (toTokenPriceInUSD <= 0) {
      return '0'
    }

    // Calculate the provider fee (0.85% of the source token amount)
    const providerFee = NumberUtil.bigNumber(sourceTokenAmount).times(0.0085)

    // Adjust the source token amount by subtracting the provider fee
    const adjustedSourceTokenAmount = NumberUtil.bigNumber(sourceTokenAmount).minus(providerFee)

    // Proceed with conversion using the adjusted source token amount
    const sourceAmountInSmallestUnit = adjustedSourceTokenAmount.times(
      NumberUtil.bigNumber(10).pow(sourceTokenDecimals)
    )

    const priceRatio = NumberUtil.bigNumber(sourceTokenPriceInUSD).div(toTokenPriceInUSD)

    const decimalDifference = sourceTokenDecimals - toTokenDecimals
    const toTokenAmountInSmallestUnit = sourceAmountInSmallestUnit
      .times(priceRatio)
      .div(NumberUtil.bigNumber(10).pow(decimalDifference))

    const toTokenAmount = toTokenAmountInSmallestUnit.div(
      NumberUtil.bigNumber(10).pow(toTokenDecimals)
    )

    const amount = toTokenAmount.toFixed(toTokenDecimals).toString()

    return amount
  }
}
