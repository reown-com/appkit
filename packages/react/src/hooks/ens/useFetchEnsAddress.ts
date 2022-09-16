import { ClientCtrl } from '@web3modal/core'
import type { FetchEnsAddressOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useFetchEnsAddress(opts?: FetchEnsAddressOpts) {
  const { data: address, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: FetchEnsAddressOpts) => {
      return ClientCtrl.ethereum().fetchEnsAddress(funcOpts)
    },
    opts
  )

  return {
    address,
    ...fetchResult
  }
}
