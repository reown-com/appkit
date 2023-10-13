import type { CaipNetwork } from '@web3modal/scaffold'
import type { Chain } from '@wagmi/core'
import { NAMESPACE, NetworkImageIds } from '@web3modal/utils'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${NAMESPACE}:${chain.id}`,
    name: chain.name,
    imageId: NetworkImageIds[chain.id]
  } as CaipNetwork
}
