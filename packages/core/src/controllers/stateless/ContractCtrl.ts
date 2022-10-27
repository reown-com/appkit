import type {
  ContractCtrlGetArgs,
  ContractCtrlReadArgs,
  ContractCtrlWatchEventArgs,
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
    // @ts-expect-error TODO(ilja) - Fix when implementing abi type inheritance
    const data = await ClientCtrl.ethereum().writeContract(config)

    return data
  },

  watchRead(callback: ContractCtrlWatchReadArgs[1], options: ContractCtrlWatchReadArgs[0]) {
    const unwatch = ClientCtrl.ethereum().watchReadContract(
      { ...options, listenToBlock: true },
      callback
    )

    return unwatch
  },

  watchEvent(callback: ContractCtrlWatchEventArgs[1], contract: ContractCtrlWatchEventArgs[0]) {
    const unwatch = ClientCtrl.ethereum().watchContractEvent(contract, callback)

    return unwatch
  }
}
