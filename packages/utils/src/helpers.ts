import type { CaipNetworkId, Tokens } from '@web3modal/scaffold'
import { NAMESPACE } from './constants.js'

export function caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
  return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
}

export function getCaipTokens(tokens?: Tokens) {
  if (!tokens) {
    return undefined
  }

  const caipTokens: Tokens = {}
  Object.entries(tokens).forEach(([id, token]) => {
    caipTokens[`${NAMESPACE}:${id}`] = token
  })

  return caipTokens
}
