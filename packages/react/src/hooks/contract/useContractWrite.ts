import { ClientCtrl } from '@web3modal/core'
import type { WriteContractOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useWriteContract() {
  const res = useAsyncHookBuilder(async (opts: WriteContractOpts) =>
    ClientCtrl.ethereum().writeContract(opts)
  )

  return res
}
