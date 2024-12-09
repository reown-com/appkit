import type { CaipNetwork } from '@reown/appkit-common'

export const UnitsUtil = {
  parseSatoshis(amount: string, network: CaipNetwork): string {
    const value = parseFloat(amount) / 10 ** network.nativeCurrency.decimals

    // eslint-disable-next-line new-cap
    return Intl.NumberFormat('en-US', {
      maximumFractionDigits: network.nativeCurrency.decimals
    }).format(value)
  }
}
