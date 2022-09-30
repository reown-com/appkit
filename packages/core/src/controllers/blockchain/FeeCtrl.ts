import type { FeeCtrlFetchArgs } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const FeeCtrl = {
  async fetch(args: FeeCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchFeeData(args)

    return data
  }
}
