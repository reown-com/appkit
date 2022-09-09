import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useNetwork() {
  const { data: network, ...fetchResult } = useAsyncHookBuilder(async () =>
    ClientCtrl.ethereum().getNetwork()
  )

  return {
    network,
    ...fetchResult
  }
}
