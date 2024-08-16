import type { CaipAddress, CaipNetworkId } from './TypeUtil.js'

type ParsedCaipAddress = {
  key: string
  chainId: string
  address: string
}

type ParsedCaipNetworkId = {
  key: string
  chainId: string
}

export const ParseUtil = {
  parseCaipAddress(caipAddress: CaipAddress): ParsedCaipAddress {
    const parts = caipAddress.split(':')
    if (parts.length !== 3) {
      throw new Error(`Invalid CAIP-10 address: ${caipAddress}`)
    }

    const [key, chainId, address] = parts

    if (!key || !chainId || !address) {
      throw new Error(`Invalid CAIP-10 address: ${caipAddress}`)
    }

    return { key, chainId, address }
  },
  parseCaipNetworkId(caipNetworkId: CaipNetworkId): ParsedCaipNetworkId {
    const [key, chainId] = caipNetworkId.split(':')

    if (!key || !chainId) {
      throw new Error(`Invalid CAIP-2 network id: ${caipNetworkId}`)
    }

    return { key, chainId }
  }
}
