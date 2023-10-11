import type { CaipNetwork } from '@web3modal/scaffold'
import { NAMESPACE } from '../constants.js'
import { NetworkImageIds } from '../presets.js'
import type { Chain, WindowProvider } from '@wagmi/core'

export function getWagmiCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${NAMESPACE}:${chain.id}`,
    name: chain.name,
    imageId: NetworkImageIds[chain.id]
  } as CaipNetwork
}

export function getDefaultWindowProvider() {
  if (typeof window === 'undefined') {
    return undefined
  }
  const ethereum = (window as unknown as { ethereum?: WindowProvider }).ethereum
  if (ethereum?.providers) {
    return ethereum.providers[0]
  }

  return ethereum
}
