import type { CaipNetwork } from '@web3modal/scaffold'
import { NAMESPACE } from '../constants.js'
import { NetworkImageIds, NetworkNames } from '../presets.js'

export function getEthersCaipDefaultChain(chain?: number) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${NAMESPACE}:${chain}`,
    name: NetworkNames[chain],
    imageId: NetworkImageIds[chain]
  } as CaipNetwork
}

export function hexStringToNumber(value: string) {
  const string = value.startsWith('0x') ? value.slice(2) : value
  const number = parseInt(string, 16)

  return number
}
