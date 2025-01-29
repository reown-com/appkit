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
    const totalGasCostInEther = NumberUtil.bigNumber(
      SwapCalculationUtil.getGasPriceInEther(gas, gasPrice)
    )
    const networkPriceInUSD = NumberUtil.bigNumber(networkPrice)
    const gasCostInUSD = networkPriceInUSD * totalGasCostInEther

    return Number(gasCostInUSD)
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
    const inputValue =
      NumberUtil.bigNumber(sourceTokenAmount) * NumberUtil.bigNumber(sourceTokenPriceInUSD)
    const outputValue =
      NumberUtil.bigNumber(toTokenAmount) * NumberUtil.bigNumber(toTokenPriceInUSD)
    const priceImpact = NumberUtil.divide(inputValue - outputValue, inputValue) * 100n

    return Number(priceImpact)
  },

  getMaxSlippage(slippage: number, toTokenAmount: string) {
    const slippageToleranceDecimal = NumberUtil.divide(NumberUtil.bigNumber(slippage), 100n)
    const maxSlippageAmount = NumberUtil.multiply(toTokenAmount, slippageToleranceDecimal)

    return Number(maxSlippageAmount)
  },

  getProviderFee(sourceTokenAmount: string, feePercentage = 0.0085) {
    const providerFee = NumberUtil.multiply(sourceTokenAmount, feePercentage)

    return providerFee.toString()
  },

  isInsufficientNetworkTokenForGas(networkBalanceInUSD: string, gasPriceInUSD: number | undefined) {
    const gasPrice = gasPriceInUSD || '0'

    if (NumberUtil.bigNumber(networkBalanceInUSD) === 0n) {
      return true
    }

    return (
      NumberUtil.bigNumber(NumberUtil.bigNumber(gasPrice)) >
      NumberUtil.bigNumber(networkBalanceInUSD)
    )
  },

  isInsufficientSourceTokenForSwap(
    sourceTokenAmount: string,
    sourceTokenAddress: string,
    balance: SwapTokenWithBalance[] | undefined
  ) {
    const sourceTokenBalance = balance?.find(token => token.address === sourceTokenAddress)
      ?.quantity?.numeric

    const isInSufficientBalance =
      NumberUtil.bigNumber(sourceTokenBalance || '0') < NumberUtil.bigNumber(sourceTokenAmount)

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
    const providerFee = NumberUtil.multiply(sourceTokenAmount, 0.0085)

    // Adjust the source token amount by subtracting the provider fee
    const adjustedSourceTokenAmount = NumberUtil.bigNumber(sourceTokenAmount) - providerFee

    // Proceed with conversion using the adjusted source token amount
    const sourceAmountInSmallestUnit =
      adjustedSourceTokenAmount * 10n ** NumberUtil.bigNumber(sourceTokenDecimals)

    const priceRatio = NumberUtil.divide(sourceTokenPriceInUSD, toTokenPriceInUSD)

    const decimalDifference = sourceTokenDecimals - toTokenDecimals
    const toTokenAmountInSmallestUnit = NumberUtil.multiply(
      sourceAmountInSmallestUnit,
      NumberUtil.divide(priceRatio, 10 ** decimalDifference)
    )

    const toTokenAmount = NumberUtil.divide(toTokenAmountInSmallestUnit, 10 ** toTokenDecimals)

    const amount = Number(toTokenAmount).toFixed(toTokenDecimals).toString()

    return amount
  }
}
