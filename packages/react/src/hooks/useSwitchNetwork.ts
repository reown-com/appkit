import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useSwitchNetwork() {
  const { data, refetch, ...fetchResult } = useAsyncHookBuilder(ClientCtrl.ethereum().switchChain)

  return {
    chainId: data,
    switchChain: refetch,
    ...fetchResult
  }
}
