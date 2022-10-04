import type { TokenCtrlFetchArgs } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const TokenCtrl = {
  async fetch(args: TokenCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchToken(args)

    return data
  }
}
