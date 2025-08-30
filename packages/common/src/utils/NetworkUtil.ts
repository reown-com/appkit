import { ConstantsUtil } from './ConstantsUtil.js'
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

  getNetworkNameByCaipNetworkId(
    caipNetworks: CaipNetwork[],
    caipNetworkId: CaipNetworkId
  ): string | undefined {
    if (!caipNetworkId) {
      return undefined
    }

    const caipNetwork = caipNetworks.find(network => network.caipNetworkId === caipNetworkId)

    if (caipNetwork) {
      return caipNetwork.name
    }

    const [namespace] = caipNetworkId.split(':') as [ChainNamespace]

    return ConstantsUtil.CHAIN_NAME_MAP?.[namespace] || undefined
  }
}

export const AVAILABLE_NAMESPACES: ChainNamespace[] = [
  'eip155',
  'solana',
  'polkadot',
  'bip122',
  'cosmos',
  'sui',
  'stacks'
] as const
