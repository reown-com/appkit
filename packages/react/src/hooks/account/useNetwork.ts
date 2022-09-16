import { ClientCtrl } from '@web3modal/core'
import { useSyncHookBuilder } from '../../utils/useSyncHookBuilder'

export function useNetwork() {
  const { data: network, ...fetchResult } = useSyncHookBuilder(() =>
    ClientCtrl.ethereum().getNetwork()
  )

  return {
    network,
    ...fetchResult
  }
}
