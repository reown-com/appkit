import type { ContractCtrlGetArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useController } from '../utils/useController'

export function useContract(args: ContractCtrlGetArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { data, isReady } = useController({ getFn: ContractCtrl.get, args: chainAgnosticArgs })

  return { contract: data, isReady }
}
