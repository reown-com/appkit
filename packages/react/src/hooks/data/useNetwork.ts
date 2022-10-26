import { NetworkCtrl } from '@web3modal/core'
import { useController } from '../utils/useController'

export function useNetwork() {
  const { data } = useController({
    getFn: NetworkCtrl.get,
    watchFn: NetworkCtrl.watch,
    args: undefined
  })

  if (!data) throw new Error('Failed to retrieve network')

  return { ...data }
}
