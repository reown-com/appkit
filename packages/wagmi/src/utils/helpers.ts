import type { Chain } from '@wagmi/core'
import type { CaipNetwork } from '@web3modal/scaffold'
import { NAMESPACE } from './constants.js'
import { NetworkImageIds } from './presets.js'

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
