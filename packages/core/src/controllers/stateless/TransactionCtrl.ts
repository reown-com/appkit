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
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        if ('request' in args)
          return ClientCtrl.ethereum().sendTransaction(
            await ClientCtrl.ethereum().prepareSendTransaction(args)
          )
        throw new Error('Args did not match Ethereum Parameters')
      case 'solana':
        if ('amountInLamports' in args)
          return ClientCtrl.solana().signAndSendTransaction('transfer', args)
        throw new Error('Args did not match Solana Parameters')
      default:
        throw new Error('No provider available to send transaction')
    }
  },

  async wait(args: TransactionCtrlWaitArgs) {
    const data = await ClientCtrl.ethereum().waitForTransaction(args)

    return data
  }
}
