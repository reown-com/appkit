import type { FeeCtrlFetchArgs, FeeCtrlFetchReturnValue } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const FeeCtrl = {
  watch(callback: (data: FeeCtrlFetchReturnValue) => void, args: FeeCtrlFetchArgs) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber({ ...args, listen: true }, async () => {
      const data = await FeeCtrl.fetch(args)
      callback(data)
    })

    return unwatch
  },

  async fetch(args: FeeCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchFeeData(args)

    return data
  }
}
