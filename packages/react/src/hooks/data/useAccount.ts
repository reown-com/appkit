import type { AccountCtrlGetReturnValue } from '@web3modal/core'
import { AccountCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useAccount(): Partial<AccountCtrlGetReturnValue> {
  const { data } = useStatefullController<AccountCtrlGetReturnValue>(AccountCtrl)

  return { ...data }
}
