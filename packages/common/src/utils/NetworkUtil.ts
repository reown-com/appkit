import type { CaipNetwork, CaipNetworkId, ChainNamespace } from './TypeUtil.js'

export const NetworkUtil = {
  caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
    return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
  },

  parseEvmChainId(chainId: string | number) {
    return typeof chainId === 'string'
      ? this.caipNetworkIdToNumber(chainId as CaipNetworkId)
      : chainId
  },

  getNetworksByNamespace(networks: CaipNetwork[] | undefined, namespace: ChainNamespace) {
    return networks?.filter(network => network.chainNamespace === namespace) || []
  },

  getFirstNetworkByNamespace(networks: CaipNetwork[] | undefined, namespace: ChainNamespace) {
    return this.getNetworksByNamespace(networks, namespace)[0]
  },

  getNetworkNameByCaipNetworkId(caipNetworkId?: CaipNetworkId | string): string | undefined {
    if (!caipNetworkId) return undefined

    const [namespace] = caipNetworkId.split(':')

    const networkNames: Record<string, string> = {
      'eip155:1': 'Ethereum Mainnet',
      'eip155:10': 'Optimism',
      'eip155:56': 'BNB Chain',
      'eip155:137': 'Polygon',
      'eip155:42161': 'Arbitrum',
      'eip155:43114': 'Avalanche',
      'eip155:8453': 'Base',

      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'Solana Devnet',
      'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'Solana Testnet',

      'bip122:000000000019d6689c085ae165831e93': 'Bitcoin',
      'bip122:000000000933ea01ad0ee984209779ba': 'Bitcoin Testnet'
    }

    if (networkNames[caipNetworkId]) {
      return networkNames[caipNetworkId]
    }

    const namespaceNames: Record<string, string> = {
      eip155: 'Ethereum',
      solana: 'Solana',
      polkadot: 'Polkadot',
      bip122: 'Bitcoin',
      cosmos: 'Cosmos'
    }

    if(namespace && namespaceNames[namespace]) {
      return `${namespaceNames[namespace]} chain`
    }

    return undefined
  }
}
