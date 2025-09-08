import { type Chain as ViemChain, type createPublicClient, type http } from 'viem'

import { type CaipNetworkId, ParseUtil } from '@reown/appkit-common'

import { OptionsController } from '../controllers/OptionsController.js'

// -- Types --------------------------------------------------------------------
type PublicClient = typeof createPublicClient
type Http = typeof http
type ViemUtils = {
  chains: Record<string, ViemChain>
  createPublicClient: PublicClient
  http: Http
}

// -- Constants ----------------------------------------------------------------
let cachedViemUtils: ViemUtils | undefined = undefined

// -- Helpers ------------------------------------------------------------------
async function loadViemUtils() {
  if (!cachedViemUtils) {
    const viemChains = await import('viem/chains')

    const { createPublicClient, http } = await import('viem')

    cachedViemUtils = {
      chains: viemChains as unknown as Record<string, ViemChain>,
      createPublicClient,
      http
    }
  }

  return cachedViemUtils
}

// -- Utils --------------------------------------------------------------------
export const ViemUtil = {
  getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string) {
    const url = new URL('https://rpc.walletconnect.org/v1/')
    url.searchParams.set('chainId', caipNetworkId)
    url.searchParams.set('projectId', projectId)

    return url.toString()
  },
  async getViemChainById(caipNetworkId: CaipNetworkId) {
    const { chains } = await loadViemUtils()

    const { chainId } = ParseUtil.parseCaipNetworkId(caipNetworkId)

    for (const chain of Object.values(chains)) {
      if (chain.id.toString() === chainId.toString()) {
        return chain
      }
    }

    return undefined
  },
  async createViemPublicClient(caipNetworkId: CaipNetworkId) {
    const { createPublicClient, http } = await loadViemUtils()

    const projectId = OptionsController.state.projectId

    const viemChain = await ViemUtil.getViemChainById(caipNetworkId)

    if (!viemChain) {
      throw new Error(`Chain ${caipNetworkId} not found in viem/chains`)
    }

    return createPublicClient({
      chain: viemChain,
      transport: http(ViemUtil.getBlockchainApiRpcUrl(caipNetworkId, projectId))
    })
  }
}
