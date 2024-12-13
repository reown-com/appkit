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
  }
}
