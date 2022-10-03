import type {
  BlockCtrlWatchCallback,
  BlockCtrlWatchOptions
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

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
