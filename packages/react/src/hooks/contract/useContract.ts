import { ClientCtrl } from '@web3modal/core'
import type { GetContractOpts } from '@web3modal/ethereum'
import { useSyncHookBuilder } from '../../utils/useSyncHookBuilder'

export function useContract(initialOpts?: GetContractOpts) {
  const { data: contract, ...fetchResult } = useSyncHookBuilder(
    (opts: GetContractOpts) => ClientCtrl.ethereum().getContract(opts),
    initialOpts
  )

  return {
    contract,
    ...fetchResult
  }
}
