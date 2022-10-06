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
    const data = await ClientCtrl.ethereum().signMessage(args)

    return data
  },

  async signTypedData(args: SignerCtrlSignTypedDataArgs) {
    const data = await ClientCtrl.ethereum().signTypedData(args)

    return data
  }
}
