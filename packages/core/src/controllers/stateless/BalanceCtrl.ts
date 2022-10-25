import type {
  BalanceCtrlFetchArgs,
  BalanceCtrlFetchReturnValue
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const BalanceCtrl = {
  watch(args: BalanceCtrlFetchArgs, callback: (data: BalanceCtrlFetchReturnValue) => void) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().watchBlockNumber({ ...args, listen: true }, async () => {
          const data = (await BalanceCtrl.fetch(args)) as BalanceCtrlFetchReturnValue
          callback(data)
        })

      default:
        throw new Error('No active client that supports watching')
    }
  },

  async fetch(args: BalanceCtrlFetchArgs) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().fetchBalance(args)
      case 'solana':
        return ClientCtrl.solana().getBalance(args.addressOrName)
      default:
        throw new Error('No active client that supports fetching balance')
    }
  }
}
