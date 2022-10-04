import type { ContractCtrlGetArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useController } from '../utils/useController'

export function useContract(args: ContractCtrlGetArgs) {
  const { data } = useController({ getFn: ContractCtrl.get, args })

  return data
}
