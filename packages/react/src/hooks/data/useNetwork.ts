import { NetworkCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useNetwork() {
  const data = useStatefullController(NetworkCtrl)

  return data
}
