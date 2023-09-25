import type { WindowProvider } from '@wagmi/core'
import type { CaipNetwork, CaipNetworkId, Tokens } from '@web3modal/scaffold'
import type { Web3ModalClientOptions } from '../client.js'
import { NAMESPACE } from './constants.js'
import { NetworkImageIds } from './presets.js'

export function getCaipDefaultChain(chain?: Web3ModalClientOptions['defaultChain']) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${NAMESPACE}:${chain.id}`,
    name: chain.name,
    imageId: NetworkImageIds[chain.id]
  } as CaipNetwork
}

export function getCaipTokens(tokens?: Web3ModalClientOptions['tokens']) {
  if (!tokens) {
    return undefined
  }

  const caipTokens: Tokens = {}
  Object.entries(tokens).forEach(([id, token]) => {
    caipTokens[`${NAMESPACE}:${id}`] = token
  })

  return caipTokens
}

export function caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
  return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
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
