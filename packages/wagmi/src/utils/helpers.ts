import type { CaipNetwork, Tokens } from '@web3modal/scaffold'
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
