import type { CaipNetwork } from '@web3modal/scaffold'
import type { Chain } from '@wagmi/core'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.id}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.id]
  } as CaipNetwork
}
