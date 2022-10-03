import type { TokenCtrlFetchArgs } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const TokenCtrl = {
  async fetch(args: TokenCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchToken(args)

    return data
  }
}
