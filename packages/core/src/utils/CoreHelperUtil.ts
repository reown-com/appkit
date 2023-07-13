import { CaipAddress } from './TypeUtils'

export const CoreHelperUtil = {
  isClient() {
    return typeof window !== 'undefined'
  },

  getPlainAddress(caipAddress: CaipAddress) {
    return caipAddress.split(':')[2]
  },

  truncateAddress(address: string) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
  }
}
