import type { AccountCtrlGetReturnValue } from '@web3modal/core'
import { AccountCtrl } from '@web3modal/core'
import { useController } from '../utils/useController'

export function useAccount(): Partial<AccountCtrlGetReturnValue> {
  const { data } = useController({
    getFn: AccountCtrl.get,
    watchFn: AccountCtrl.watch,
    args: undefined
  })

  return { ...data }
}
