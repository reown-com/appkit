import { ConstantsUtil } from './ConstantsUtil'
import { CaipAddress } from './TypeUtils'

export const CoreHelperUtil = {
  isClient() {
    return typeof window !== 'undefined'
  },

  isActivePairingExpiry(expiry: number) {
    return expiry - Date.now() >= ConstantsUtil.ONE_MINUTE_MS
  },

  truncateAddress(address: string) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  },

  copyToClopboard(text: string) {
    navigator.clipboard.writeText(text)
  },

  getPairingExpiry() {
    return Date.now() + ConstantsUtil.FIVE_MINUTES_MS
  },

  getPlainAddress(caipAddress: CaipAddress) {
    return caipAddress.split(':')[2]
  }
}
