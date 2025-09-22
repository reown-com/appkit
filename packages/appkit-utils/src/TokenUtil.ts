import { baseSepoliaUSDC, baseUSDC } from '@reown/appkit-controllers'

export const TokenUtil = {
  TOKEN_ADDRESSES_BY_SYMBOL: {
    USDC: {
      8453: baseUSDC.asset,
      84532: baseSepoliaUSDC.asset
    }
  },
  getTokenSymbolByAddress(tokenAddress?: string) {
    if (!tokenAddress) {
      return undefined
    }

    const [symbol] =
      Object.entries(TokenUtil.TOKEN_ADDRESSES_BY_SYMBOL).find(([_, addressesByChain]) =>
        Object.values(addressesByChain).includes(tokenAddress)
      ) ?? []

    return symbol
  }
}
