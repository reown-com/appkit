import type {
  FeeCtrlFetchArgs,
  FeeCtrlFetchFeeForMessage,
  FeeCtrlFetchReturnValue
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const FeeCtrl = {
  watch(args: FeeCtrlFetchArgs, callback: (data: FeeCtrlFetchReturnValue) => void) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber({ ...args, listen: true }, async () => {
      const data = await FeeCtrl.fetch(args)
      callback(data)
    })

    return unwatch
  },

  async fetchFeeForMessage<Type extends 'transfer'>(type: Type, args: FeeCtrlFetchFeeForMessage) {
    if ('to' in args) return ClientCtrl.solana().getFeeForMessage<Type>(type, args)
    throw new Error('Need transfer args for fetchFeeForMessage')
  },

  async fetch(args: FeeCtrlFetchArgs) {
    const data = await ClientCtrl.ethereum().fetchFeeData(args)

    return data
  }
}
