import { ClientCtrl } from '@web3modal/core'
import type { FetchEnsNameOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useFetchEnsName(opts: FetchEnsNameOpts) {
  const { data: address, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: FetchEnsNameOpts) => {
      return ClientCtrl.ethereum().fetchEnsName(funcOpts)
    },
    opts
  )

  return {
    address,
    ...fetchResult
  }
}
