import { AccountCtrl } from '@web3modal/core'
import { useController } from '../utils/useController'

export function useAccount() {
  const { data } = useController({
    getFn: AccountCtrl.get,
    watchFn: AccountCtrl.watch,
    args: undefined
  })
  const account = {
    address: data?.address ?? '',
    isConnected: data?.isConnected,
    isDisconnected: !data?.isConnected
  }

  return account
}
