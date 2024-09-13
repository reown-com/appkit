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
      url.searchParams.set('projectId', projectId)

      return url.toString()
    }

    return rpcUrl
  }
}
