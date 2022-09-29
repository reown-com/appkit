import type { BalanceCtrlFetchArgs } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const BalanceCtrl = {
  async fetch(args: BalanceCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchBalance(args)

    return data
  }
}
