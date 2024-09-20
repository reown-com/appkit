import type { CaipNetwork } from './TypeUtil.js'

const RPC_URL_HOST = 'rpc.walletconnect.org'

type ExtendCaipNetworkParams = {
  networkImageIds: Record<number | string, string>
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
    caipNetwork: CaipNetwork,
    { networkImageIds, customNetworkImageUrls, projectId }: ExtendCaipNetworkParams
  ): CaipNetwork {
    return {
      ...caipNetwork,
      imageId: networkImageIds[caipNetwork.chainId],
      imageUrl: customNetworkImageUrls?.[caipNetwork.chainId],
      rpcUrl: CaipNetworksUtil.extendRpcUrlWithProjectId(caipNetwork.rpcUrl, projectId)
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
    caipNetworks: CaipNetwork[],
    { networkImageIds, customNetworkImageUrls, projectId }: ExtendCaipNetworkParams
  ): CaipNetwork[] {
    return caipNetworks.map(caipNetwork =>
      CaipNetworksUtil.extendCaipNetwork(caipNetwork, {
        networkImageIds,
        customNetworkImageUrls,
        projectId
      })
    )
  }
}
