import type {
  NetworkCtrlSwitchNetworkArgs,
  NetworkCtrlWatchCallback,
  NetworkCtrlWatchCallbackEth,
  NetworkCtrlWatchCallbackSol
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const NetworkCtrl = {
  watch(_options: undefined, callback: NetworkCtrlWatchCallback) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().watchNetwork(callback as NetworkCtrlWatchCallbackEth)
      case 'solana':
        return ClientCtrl.solana().watchNetwork(callback as NetworkCtrlWatchCallbackSol)
      default:
        throw new Error('No provider that supports watching network')
    }
  },

  get() {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().getNetwork()
      case 'solana':
        return {
          cluster: ClientCtrl.solana().getNetwork(),
          clusters: ClientCtrl.solana().getAvailableNetworks()
        }
      default:
        throw new Error('No provider active that supports switchNetwork')
    }
  },

  async switchNetwork(args: NetworkCtrlSwitchNetworkArgs) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        if ('chainId' in args) await ClientCtrl.ethereum().switchNetwork(args)
        throw new Error('Need chainId for Ethereum network switch')
      case 'solana':
        if ('name' in args) ClientCtrl.solana().switchNetwork(args)
        throw new Error('Need full cluster data for Solana network switch')
      default:
        throw new Error('No provider supporting network switching')
    }
  }
}
