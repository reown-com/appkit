import type { ContractCtrlWriteArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useContractWrite(args: ContractCtrlWriteArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: ContractCtrl.write,
    args: {
      ...chainAgnosticArgs,
      enabled: false,
      watch: false
    }
  })

  return {
    ...rest,
    write: onFetch
  }
}
