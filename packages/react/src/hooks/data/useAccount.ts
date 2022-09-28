import { AccountCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useAccount() {
  const data = useStatefullController(AccountCtrl)

  return data
}
