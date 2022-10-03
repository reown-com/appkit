import type {
  BalanceCtrlFetchArgs,
  BalanceCtrlFetchReturnValue
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const BalanceCtrl = {
  watch(args: BalanceCtrlFetchArgs, callback: (data: BalanceCtrlFetchReturnValue) => void) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber({ ...args, listen: true }, async () => {
      const data = await BalanceCtrl.fetch(args)
      callback(data)
    })

    return unwatch
  },

  async fetch(args: BalanceCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchBalance(args)

    return data
  }
}
