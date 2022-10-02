import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSwitchNetwork() {
  const { data, refetch, ...fetchResult } = useAsyncHookBuilder(async (chainId: string) =>
    ClientCtrl.ethereum().switchChain(chainId)
  )

  return {
    chainId: data,
    switchChain: refetch,
    ...fetchResult
  }
}
