import { ClientCtrl } from '@web3modal/core'
import type { WriteContractOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useContractWrite(initialOpts?: WriteContractOpts) {
  const res = useAsyncHookBuilder(
    async (opts: WriteContractOpts) => ClientCtrl.ethereum().writeContract(opts),
    initialOpts
  )

  return res
}
