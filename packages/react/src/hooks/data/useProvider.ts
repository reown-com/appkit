import { ProviderCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useProvider() {
  const data = useStatefullController(ProviderCtrl)

  return data
}
