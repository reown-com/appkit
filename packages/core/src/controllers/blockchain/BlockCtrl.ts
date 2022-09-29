import type {
  BlockCtrlWatchCallback,
  BlockCtrlWatchOptions
} from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const BlockCtrl = {
  watch(options: BlockCtrlWatchOptions, callback: BlockCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber({ ...options, listen: true }, callback)

    return unwatch
  },

  async fetch(options?: BlockCtrlWatchOptions) {
    const data = await ClientCtrl.ethereum().fetchBlockNumber(options)

    return data
  }
}
