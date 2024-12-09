import type { CaipAddress, CaipNetworkId, ChainId, ChainNamespace } from './TypeUtil.js'

export type ParsedCaipAddress = {
  chainNamespace: ChainNamespace
  chainId: ChainId
  address: string
}

type ParsedCaipNetworkId = {
  chainNamespace: ChainNamespace
  chainId: ChainId
}

export const ParseUtil = {
  parseCaipAddress(caipAddress: CaipAddress): ParsedCaipAddress {
    const parts = caipAddress.split(':')
    if (parts.length !== 3) {
      throw new Error(`Invalid CAIP-10 address: ${caipAddress}`)
    }

    const [chainNamespace, chainId, address] = parts

    if (!chainNamespace || !chainId || !address) {
      throw new Error(`Invalid CAIP-10 address: ${caipAddress}`)
    }

    return {
      chainNamespace: chainNamespace as ChainNamespace,
      chainId: chainId as ChainId,
      address
    }
  },
  parseCaipNetworkId(caipNetworkId: CaipNetworkId): ParsedCaipNetworkId {
    const parts = caipNetworkId.split(':')
    if (parts.length !== 2) {
      throw new Error(`Invalid CAIP-2 network id: ${caipNetworkId}`)
    }

    const [chainNamespace, chainId] = parts

    if (!chainNamespace || !chainId) {
      throw new Error(`Invalid CAIP-2 network id: ${caipNetworkId}`)
    }

    return {
      chainNamespace: chainNamespace as ChainNamespace,
      chainId: chainId as ChainId
    }
  }
}
