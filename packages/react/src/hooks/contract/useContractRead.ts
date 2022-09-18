import { ClientCtrl } from '@web3modal/core'
import type { ReadContractOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useContractRead(initialOpts?: ReadContractOpts) {
  const { data: read, ...fetchResults } = useAsyncHookBuilder(
    async (opts: ReadContractOpts) => ClientCtrl.ethereum().readContract(opts),
    initialOpts
  )

  return {
    read,
    ...fetchResults
  }
}
