import type { CaipNetwork } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import type { Chain } from './types.js'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
  } as CaipNetwork
}

export function hexStringToNumber(value: string) {
  const string = value.startsWith('0x') ? value.slice(2) : value
  const number = parseInt(string, 16)

  return number
}

export function numberToHexString(value: number) {
  return `0x${value.toString(16)}`
}
