import type {
  TransactionCtrlFetchArgs,
  TransactionCtrlSendArgs,
  TransactionCtrlWaitArgs
} from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const TransactionCtrl = {
  async fetch(args: TransactionCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchTransaction(args)

    return data
  },

  async send(args: TransactionCtrlSendArgs) {
    const data = await ClientCtrl.ethereum().sendTransaction(args)

    return data
  },

  async wait(args: TransactionCtrlWaitArgs) {
    const data = await ClientCtrl.ethereum().waitForTransaction(args)

    return data
  }
}
