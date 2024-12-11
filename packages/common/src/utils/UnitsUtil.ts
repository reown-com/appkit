import type { CaipNetwork } from './TypeUtil.js'

export const UnitsUtil = {
  toDecimal(amount: string, network: CaipNetwork): string {
    const value = parseFloat(amount) / 10 ** network.nativeCurrency.decimals

    // eslint-disable-next-line new-cap
    return Intl.NumberFormat('en-US', {
      maximumFractionDigits: network.nativeCurrency.decimals
    }).format(value)
  },
  fromDecimal(amount: string, network: CaipNetwork): string {
    const value = parseFloat(amount) * 10 ** network.nativeCurrency.decimals

    // eslint-disable-next-line new-cap
    return Intl.NumberFormat('en-US', {
      maximumSignificantDigits: network.nativeCurrency.decimals
    }).format(value)
  }
}
