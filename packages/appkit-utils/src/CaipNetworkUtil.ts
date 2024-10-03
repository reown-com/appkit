import { ConstantsUtil, type BaseOrCaipNetwork, type CaipNetwork } from '@reown/appkit-common'
import { PresetsUtil } from './PresetsUtil'

const RPC_URL_HOST = 'rpc.walletconnect.org'

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
    const isReownUrl = rpcUrl.includes(RPC_URL_HOST)

    if (isReownUrl) {
      const url = new URL(rpcUrl)
      if (!url.searchParams.has('projectId')) {
        url.searchParams.set('projectId', projectId)
      }

      return url.toString()
    }

    return rpcUrl
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
    caipNetwork: BaseOrCaipNetwork,
    { customNetworkImageUrls }: ExtendCaipNetworkParams
  ): CaipNetwork {
    const isCaipNetwork = (network: BaseOrCaipNetwork): network is CaipNetwork => {
      return 'chainNamespace' in network && 'caipNetworkId' in network
    }

    return {
      ...caipNetwork,
      chainNamespace: isCaipNetwork(caipNetwork)
        ? caipNetwork.chainNamespace
        : ConstantsUtil.CHAIN.EVM,
      caipNetworkId: isCaipNetwork(caipNetwork)
        ? caipNetwork.caipNetworkId
        : `${ConstantsUtil.CHAIN.EVM}:${caipNetwork.id}`,
      assets: {
        imageId: PresetsUtil.NetworkImageIds[caipNetwork.id],
        imageUrl: customNetworkImageUrls?.[caipNetwork.id]
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
    caipNetworks: BaseOrCaipNetwork[],
    { customNetworkImageUrls, projectId }: ExtendCaipNetworkParams
  ) {
    return caipNetworks.map(caipNetwork =>
      CaipNetworksUtil.extendCaipNetwork(caipNetwork, {
        customNetworkImageUrls,
        projectId
      })
    ) as [CaipNetwork, ...CaipNetwork[]]
  }
}
