import type {
  SignerCtrlSignMessageArgs,
  SignerCtrlSignTypedDataArgs,
  SignerCtrlWatchCallback
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const SignerCtrl = {
  watch(_options: undefined, callback: SignerCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchSigner(callback)

    return unwatch
  },

  async fetch() {
    const data = await ClientCtrl.ethereum().fetchSigner()

    return data
  },

  async signMessage(args: SignerCtrlSignMessageArgs) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().signMessage(args)
      case 'solana':
        if (typeof args.message === 'string') return ClientCtrl.solana().signMessage(args.message)
        throw new Error('Solana client can not sign raw bytes')
      default:
        throw new Error('No active client configured')
    }
  },

  async signTypedData(args: SignerCtrlSignTypedDataArgs) {
    const data = await ClientCtrl.ethereum().signTypedData(args)

    return data
  }
}
