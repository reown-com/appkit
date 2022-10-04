import type {
  TransactionCtrlFetchArgs,
  TransactionCtrlSendArgs,
  TransactionCtrlWaitArgs
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const TransactionCtrl = {
  async fetch(args: TransactionCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchTransaction(args)

    return data
  },

  async send(args: TransactionCtrlSendArgs) {
    const config = await ClientCtrl.ethereum().prepareSendTransaction(args)
    const data = await ClientCtrl.ethereum().sendTransaction(config)

    return data
  },

  async wait(args: TransactionCtrlWaitArgs) {
    const data = await ClientCtrl.ethereum().waitForTransaction(args)

    return data
  }
}
