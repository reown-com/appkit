import { type Chain as ViemChain } from 'viem'
import { createPublicClient, http } from 'viem'
import * as viemChains from 'viem/chains'

import { type CaipNetworkId, ParseUtil } from '@reown/appkit-common'

import { OptionsController } from '../controllers/OptionsController.js'

export const ViemUtil = {
  getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string) {
    const url = new URL('https://rpc.walletconnect.org/v1/')
    url.searchParams.set('chainId', caipNetworkId)
    url.searchParams.set('projectId', projectId)

    return url.toString()
  },
  getViemChainById(caipNetworkId: CaipNetworkId): ViemChain | undefined {
    const { chainId } = ParseUtil.parseCaipNetworkId(caipNetworkId)

    for (const chain of Object.values(viemChains)) {
      if (chain.id.toString() === chainId.toString()) {
        return chain
      }
    }

    return undefined
  },
  createViemPublicClient(caipNetworkId: CaipNetworkId) {
    const projectId = OptionsController.state.projectId

    const viemChain = ViemUtil.getViemChainById(caipNetworkId)

    if (!viemChain) {
      throw new Error(`Chain ${caipNetworkId} not found in viem/chains`)
    }

    return createPublicClient({
      chain: viemChain,
      transport: http(ViemUtil.getBlockchainApiRpcUrl(caipNetworkId, projectId))
    })
  }
}
