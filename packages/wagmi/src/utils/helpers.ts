import type { CaipNetwork } from '@web3modal/scaffold'
import type { Chain } from '@wagmi/core'
import { ConstantsUtil, PresetsUtil } from '@web3modal/utils'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.NAMESPACE}:${chain.id}`,
    name: chain.name,
    imageId: PresetsUtil.NetworkImageIds[chain.id]
  } as CaipNetwork
}
