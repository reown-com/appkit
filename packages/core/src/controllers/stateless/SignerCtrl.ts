import type {
  SignerCtrlSignMessageArgs,
  SignerCtrlSignTypedDataArgs,
  SignerCtrlWatchCallback,
  SignerCtrlWatchOptions
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const SignerCtrl = {
  watch(callback: SignerCtrlWatchCallback, options: SignerCtrlWatchOptions) {
    const unwatch = ClientCtrl.ethereum().watchSigner(options, callback)

    return unwatch
  },

  async fetch(options: SignerCtrlWatchOptions) {
    const data = await ClientCtrl.ethereum().fetchSigner(options)

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
