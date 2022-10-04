import type { ContractCtrlGetArgs } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const ContractCtrl = {
  get(args: ContractCtrlGetArgs) {
    const data = ClientCtrl.ethereum().getContract(args)

    return data
  }
}
