import {
  ConstantsUtil,
  type AppKitNetwork,
  type CaipNetwork,
  type CaipNetworkId
} from '@reown/appkit-common'
import { PresetsUtil } from './PresetsUtil.js'
import { fallback, http } from 'viem'

const RPC_URL_HOST = 'rpc.walletconnect.org'

export function getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string) {
  const url = new URL('https://rpc.walletconnect.org/v1/')
  url.searchParams.set('chainId', caipNetworkId)
  url.searchParams.set('projectId', projectId)

  return url.toString()
}

const WC_HTTP_RPC_SUPPORTED_CHAINS = [
  'near:mainnet',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  'eip155:1101',
  'eip155:56',
  'eip155:42161',
  'eip155:7777777',
  'eip155:59144',
  'eip155:324',
  'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  'eip155:5000',
  'solana:4sgjmw1sunhzsxgspuhpqldx6wiyjntz',
  'eip155:80084',
  'eip155:5003',
  'eip155:100',
  'eip155:8453',
  'eip155:42220',
  'eip155:1313161555',
  'eip155:17000',
  'eip155:1',
  'eip155:300',
  'eip155:1313161554',
  'eip155:1329',
  'eip155:84532',
  'eip155:421614',
  'eip155:11155111',
  'eip155:8217',
  'eip155:43114',
  'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  'eip155:999999999',
  'eip155:11155420',
  'eip155:80002',
  'eip155:97',
  'eip155:43113',
  'eip155:137',
  'eip155:10',
  'eip155:1301'
]

type ExtendCaipNetworkParams = {
  customNetworkImageUrls: Record<number | string, string> | undefined
  projectId: string
}

export const CaipNetworksUtil = {
  /**
   * Extends the RPC URL with the project ID if the RPC URL is a Reown URL
   * @param rpcUrl - The RPC URL to extend
   * @param projectId - The project ID to extend the RPC URL with
   * @returns The extended RPC URL
   */
  extendRpcUrlWithProjectId(rpcUrl: string, projectId: string) {
    let isReownUrl = false
    try {
      const url = new URL(rpcUrl)
      isReownUrl = url.host === RPC_URL_HOST
    } catch (e) {
      isReownUrl = false
    }

    if (isReownUrl) {
      const url = new URL(rpcUrl)
      if (!url.searchParams.has('projectId')) {
        url.searchParams.set('projectId', projectId)
      }

      return url.toString()
    }

    return rpcUrl
  },

  isCaipNetwork(network: AppKitNetwork): network is CaipNetwork {
    return 'chainNamespace' in network && 'caipNetworkId' in network
  },

  getChainNamespace(network: AppKitNetwork) {
    if (this.isCaipNetwork(network)) {
      return network.chainNamespace
    }

    return ConstantsUtil.CHAIN.EVM
  },

  getCaipNetworkId(network: AppKitNetwork) {
    if (this.isCaipNetwork(network)) {
      return network.caipNetworkId
    }

    return `${ConstantsUtil.CHAIN.EVM}:${network.id}` as CaipNetworkId
  },

  getRpcUrl(caipNetwork: AppKitNetwork, caipNetworkId: CaipNetworkId, projectId: string) {
    const defaultRpcUrl = caipNetwork.rpcUrls?.default?.http?.[0]

    if (WC_HTTP_RPC_SUPPORTED_CHAINS.includes(caipNetworkId)) {
      return getBlockchainApiRpcUrl(caipNetworkId, projectId)
    }

    return defaultRpcUrl || ''
  },

  /**
   * Extends the CaipNetwork object with the image ID and image URL if the image ID is not provided
   * @param params - The parameters object
   * @param params.caipNetwork - The CaipNetwork object to extend
   * @param params.networkImageIds - The network image IDs
   * @param params.customNetworkImageUrls - The custom network image URLs
   * @param params.projectId - The project ID
   * @returns The extended array of CaipNetwork objects
   */
  extendCaipNetwork(
    caipNetwork: AppKitNetwork,
    { customNetworkImageUrls, projectId }: ExtendCaipNetworkParams
  ): CaipNetwork {
    const caipNetworkId = this.getCaipNetworkId(caipNetwork)
    const chainNamespace = this.getChainNamespace(caipNetwork)
    const rpcUrl = this.getRpcUrl(caipNetwork, caipNetworkId, projectId)

    return {
      ...caipNetwork,
      chainNamespace,
      caipNetworkId,
      assets: {
        imageId: PresetsUtil.NetworkImageIds[caipNetwork.id],
        imageUrl: customNetworkImageUrls?.[caipNetwork.id]
      },
      rpcUrls: {
        ...caipNetwork.rpcUrls,
        default: {
          http: [rpcUrl]
        }
      }
    }
  },

  /**
   * Extends the array of CaipNetwork objects with the image ID and image URL if the image ID is not provided
   * @param caipNetworks - The array of CaipNetwork objects to extend
   * @param params - The parameters object
   * @param params.networkImageIds - The network image IDs
   * @param params.customNetworkImageUrls - The custom network image URLs
   * @param params.projectId - The project ID
   * @returns The extended array of CaipNetwork objects
   */
  extendCaipNetworks(
    caipNetworks: AppKitNetwork[],
    { customNetworkImageUrls, projectId }: ExtendCaipNetworkParams
  ) {
    return caipNetworks.map(caipNetwork =>
      CaipNetworksUtil.extendCaipNetwork(caipNetwork, {
        customNetworkImageUrls,
        projectId
      })
    ) as [CaipNetwork, ...CaipNetwork[]]
  },

  getViemTransport(caipNetwork: CaipNetwork) {
    const chainDefaultUrl = caipNetwork.rpcUrls.default.http?.[0]

    if (!WC_HTTP_RPC_SUPPORTED_CHAINS.includes(caipNetwork.caipNetworkId)) {
      return http(chainDefaultUrl)
    }

    return fallback([
      http(chainDefaultUrl, {
        /*
         * The Blockchain API uses "Content-Type: text/plain" to avoid OPTIONS preflight requests
         * It will only work for viem >= 2.17.7
         */
        fetchOptions: {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      }),
      http(chainDefaultUrl)
    ])
  }
}
