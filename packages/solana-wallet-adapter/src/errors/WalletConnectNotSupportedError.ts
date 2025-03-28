import type { WalletConnectRPCMethods } from '../constants.js'

export class WalletConnectFeatureNotSupportedError extends Error {
  constructor(method: WalletConnectRPCMethods) {
    super(`WalletConnect Adapter - Method ${method} is not supported by the wallet`)
    this.name = 'WalletConnectFeatureNotSupportedError'
  }
}
