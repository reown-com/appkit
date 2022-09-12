import { ClientCtrl } from '@web3modal/core'
import type { WriteContractOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function usePrepareContractWrite() {
  const { data: write, ...fetchResults } = useAsyncHookBuilder(async (opts: WriteContractOpts) =>
    ClientCtrl.ethereum().writeContract(opts)
  )

  return {
    write,
    ...fetchResults
  }
}
