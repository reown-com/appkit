import type {
  BlockCtrlWatchCallback,
  BlockCtrlWatchOptions
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const BlockCtrl = {
  watch(callback: BlockCtrlWatchCallback, options: BlockCtrlWatchOptions) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber({ ...options, listen: true }, callback)

    return unwatch
  },

  async fetch(options: BlockCtrlWatchOptions) {
    const data = await ClientCtrl.ethereum().fetchBlockNumber(options)

    return data
  }
}
