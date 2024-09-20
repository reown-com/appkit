import type { CaipNetwork } from './TypeUtil.js'

const RPC_URL_HOST = 'rpc.walletconnect.org'

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
   * Extends the CaipNetwork objects with the image ID and image URL if the image ID is not provided
   * @param params - The parameters object
   * @param params.caipNetworks - The array of CaipNetwork objects to extend
   * @param params.networkImageIds - The network image IDs
   * @param params.customNetworkImageUrls - The custom network image URLs
   * @param params.projectId - The project ID
   * @returns The extended array of CaipNetwork objects
   */
  extendCaipNetworks({
    caipNetworks,
    networkImageIds,
    customNetworkImageUrls,
    projectId
  }: {
    caipNetworks: CaipNetwork[]
    networkImageIds: Record<number | string, string>
    customNetworkImageUrls: Record<number | string, string> | undefined
    projectId: string
  }): CaipNetwork[] {
    return caipNetworks.map(caipNetwork => ({
      ...caipNetwork,
      imageId: networkImageIds[caipNetwork.chainId],
      imageUrl: customNetworkImageUrls?.[caipNetwork.chainId],
      rpcUrl: CaipNetworksUtil.extendRpcUrlWithProjectId(caipNetwork.rpcUrl, projectId)
    }))
  }
}
