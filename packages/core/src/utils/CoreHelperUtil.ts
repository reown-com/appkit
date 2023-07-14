import { ConstantsUtil } from './ConstantsUtil'
import { CaipAddress } from './TypeUtils'

export const CoreHelperUtil = {
  isClient() {
    return typeof window !== 'undefined'
  },

  isPairingExpired(expiry?: number) {
    return expiry ? expiry - Date.now() <= ConstantsUtil.TEN_SEC_MS : true
  },

  isAllowedRetry(lastRetry: number) {
    return Date.now() - lastRetry >= ConstantsUtil.ONE_SEC_MS
  },

  truncateAddress(address: string) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  },

  copyToClopboard(text: string) {
    navigator.clipboard.writeText(text)
  },

  getPairingExpiry() {
    return Date.now() + ConstantsUtil.FOUR_MINUTES_MS
  },

  getPlainAddress(caipAddress: CaipAddress) {
    return caipAddress.split(':')[2]
  }
}
