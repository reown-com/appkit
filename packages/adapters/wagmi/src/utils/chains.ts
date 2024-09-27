import type { CaipNetwork } from '@reown/appkit-common'
import { defineChain, type Chain } from 'viem'

export const ChainsUtil = {
  /**
   * Converts a Viem Chain object to a CaipNetwork object.
   * @param chain - The Viem Chain object to convert.
   * @returns The CaipNetwork object.
   */
  convertViemChainToCaipNetwork(chain: Chain): CaipNetwork {
    return {
      id: `eip155:${chain.id}`,
      chainId: chain.id,
      chainNamespace: 'eip155',
      name: chain.name,
      currency: chain.nativeCurrency.symbol,
      explorerUrl: chain.blockExplorers?.default?.url || '',
      rpcUrl: chain.rpcUrls.default.http[0] || '',
      imageUrl: undefined,
      imageId: undefined
    }
  },

  /**
   * Converts an array of CaipNetwork objects to an array of Viem Chain objects.
   * @param caipNetworks - The array of CaipNetwork objects to convert.
   * @returns An array of Viem Chain objects.
   */
  convertCaipNetworksToViemChains(caipNetworks: CaipNetwork[]) {
    const chains = caipNetworks.map(caipNetwork =>
      defineChain({
        id: Number(caipNetwork.chainId),
        name: caipNetwork.name,
        network: caipNetwork.name,
        nativeCurrency: {
          decimals: 18,
          name: caipNetwork.currency,
          symbol: caipNetwork.currency
        },
        rpcUrls: {
          default: {
            http: [caipNetwork.rpcUrl]
          }
        },
        blockExplorers: {
          default: {
            apiUrl: '',
            name: '',
            url: caipNetwork.explorerUrl || ''
          }
        },
        fees: undefined,
        formatters: undefined,
        serializers: undefined
      })
    ) as unknown as readonly [Chain, ...Chain[]]

    return chains
  }
}
