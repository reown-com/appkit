import { ClientCtrl } from '@web3modal/core'
import type { GetContractOpts } from '@web3modal/ethereum'
import { useSyncHookBuilder } from '../../utils/useSyncHookBuilder'

export function useContract(opts: GetContractOpts) {
  const { data: contract, ...fetchResult } = useSyncHookBuilder(() =>
    ClientCtrl.ethereum().getContract(opts)
  )

  fetchResult.refetch(opts)

  return {
    contract,
    ...fetchResult
  }
}
