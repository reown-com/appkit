import type {
  TransactionCtrlFetchArgs,
  TransactionCtrlSendArgs,
  TransactionCtrlWaitArgs
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const TransactionCtrl = {
  async fetch(args: TransactionCtrlFetchArgs) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().fetchTransaction(args)
      case 'solana':
        return ClientCtrl.solana().getTransaction(args.hash)
      default:
        throw new Error('No provider available to fetch transaction')
    }
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
        if ('amountInLamports' in args) {
          console.log({ args })

          return ClientCtrl.solana().signAndSendTransaction('transfer', args)
        }

        throw new Error('Args did not match Solana Parameters')
      default:
        throw new Error('No provider available to send transaction')
    }
  },

  async wait(args: TransactionCtrlWaitArgs) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().waitForTransaction(args)
      case 'solana':
        if (!args.hash) throw new Error('Need transaction hash to watch it')

        return ClientCtrl.solana().waitForTransaction(args.hash)
      default:
        throw new Error('No provider available to wait for transaction')
    }
  }
}
