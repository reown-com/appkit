import { useAsyncController } from '../utils/useAsyncController'
import { SnsCtrl } from '@web3modal/core'

export function useSnsName(name: string) {
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: SnsCtrl.fetchFavoriteDomain,
    args: name,
    hasRequiredArgs: Boolean(name)
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
