import { PresetsUtil } from './PresetsUtil.js'

export const TokenUtil = {
  getTokenSymbolByAddress(tokenAddress?: string) {
    if (!tokenAddress) {
      return undefined
    }

    const [symbol] =
      Object.entries(PresetsUtil.TOKEN_ADDRESSES_BY_SYMBOL).find(([_, addresses]) =>
        addresses.includes(tokenAddress)
      ) ?? []

    return symbol
  }
}
