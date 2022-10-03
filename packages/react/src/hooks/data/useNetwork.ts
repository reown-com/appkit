import type { NetworkCtrlGetReturnValue } from '@web3modal/core'
import { NetworkCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useNetwork() {
  const { data } = useStatefullController<NetworkCtrlGetReturnValue>(NetworkCtrl)

  return { ...data }
}
