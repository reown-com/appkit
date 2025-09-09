import { type createPublicClient, type defineChain, type http } from 'viem'

import { type CaipNetwork, type CaipNetworkId, ParseUtil } from '@reown/appkit-common'

import { OptionsController } from '../controllers/OptionsController.js'

// -- Types --------------------------------------------------------------------
type PublicClient = typeof createPublicClient
type Http = typeof http
type ViemUtils = {
  createPublicClient: PublicClient
  http: Http
  defineChain: typeof defineChain
}

// -- Constants ----------------------------------------------------------------
let cachedViemUtils: ViemUtils | undefined = undefined

// -- Helpers ------------------------------------------------------------------
async function loadViemUtils() {
  if (!cachedViemUtils) {
    const { createPublicClient, http, defineChain } = await import('viem')

    cachedViemUtils = {
      createPublicClient,
      http,
      defineChain
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
  async getViemChain(caipNetwork: CaipNetwork) {
    const { defineChain } = await loadViemUtils()

    const { chainId } = ParseUtil.parseCaipNetworkId(caipNetwork.caipNetworkId)

    return defineChain({ ...caipNetwork, id: Number(chainId) })
  },
  async createViemPublicClient(caipNetwork: CaipNetwork) {
    const { createPublicClient, http } = await loadViemUtils()

    const projectId = OptionsController.state.projectId

    const viemChain = await ViemUtil.getViemChain(caipNetwork)

    if (!viemChain) {
      throw new Error(`Chain ${caipNetwork.caipNetworkId} not found in viem/chains`)
    }

    return createPublicClient({
      chain: viemChain,
      transport: http(ViemUtil.getBlockchainApiRpcUrl(caipNetwork.caipNetworkId, projectId))
    })
  }
}
