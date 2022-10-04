import type {
  ContractCtrlGetArgs,
  ContractCtrlReadArgs,
  ContractCtrlWatchReadArgs,
  ContractCtrlWriteArgs
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const ContractCtrl = {
  get(args: ContractCtrlGetArgs) {
    const data = ClientCtrl.ethereum().getContract(args)

    return data
  },

  async read(args: ContractCtrlReadArgs) {
    const data = await ClientCtrl.ethereum().readContract(args)

    return data
  },

  async write(args: ContractCtrlWriteArgs) {
    const config = await ClientCtrl.ethereum().prepareWriteContract(args)
    const data = await ClientCtrl.ethereum().writeContract(config)

    return data
  },

  watchRead(options: ContractCtrlWatchReadArgs[0], callback: ContractCtrlWatchReadArgs[1]) {
    const unwatch = ClientCtrl.ethereum().watchReadContract(
      { ...options, listenToBlock: true },
      callback
    )

    return unwatch
  }
}
