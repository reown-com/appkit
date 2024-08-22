import { PresetsUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

import { SolConstantsUtil } from './SolanaConstantsUtil.js'

import type { CaipNetwork } from '@web3modal/scaffold'
import type { Chain, Provider } from './SolanaTypesUtil.js'

export const SolHelpersUtil = {
  detectRpcUrl(chain: Network, projectId: string) {
    if (chain.rpcUrl.includes(new URL(CommonConstantsUtil.BLOCKCHAIN_API_RPC_URL).hostname)) {
      return `${chain.rpcUrl}?chainId=solana:${chain.chainId}&projectId=${projectId}`
    }

    return chain.rpcUrl
  },

  getChain(chains: Chain[], chainId: string | null) {
    const chain = chains.find(lChain => lChain.chainId === chainId)

    if (chain) {
      return chain
    }

    return SolConstantsUtil.DEFAULT_CHAIN
  },

  getChainObjectFromCaipNetworkId(
    chains: Network[],
    chainCaipId: CaipNetworkId | undefined | null = ':'
  ): Network {
    const chainId: string = (chainCaipId?.split(':')[1] ?? '').replace(/\s/gu, '')

    const selectedChain = chains.find(chain => chain.chainId === chainId)

    if (selectedChain) {
      return {
        ...selectedChain,
        chainId: `solana:${chainId}` as CaipNetworkId,
        imageId: PresetsUtil.NetworkImageIds[chainId],
        chain: CommonConstantsUtil.CHAIN.SOLANA
      } as const
    }

    return {
      ...SolConstantsUtil.DEFAULT_CHAIN,
      id: `solana:${chainId}` as CaipNetworkId,
      chainId: `solana:${chainId}` as CaipNetworkId,
      imageId: PresetsUtil.NetworkImageIds[chainId],
      chain: CommonConstantsUtil.CHAIN.SOLANA
    } as const
  },

  getCaipDefaultChain(chain?: Chain) {
    if (!chain) {
      return undefined
    }

    return {
      id: `solana:${chain.chainId}`,
      name: chain.name,
      imageId: PresetsUtil.NetworkImageIds[chain.chainId]
    } as CaipNetwork
  },

  hexStringToNumber(value: string) {
    const hexString = value.startsWith('0x') ? value.slice(2) : value
    const decimalValue = parseInt(hexString, 16)

    return decimalValue
  },

  getAddress(provider: Provider) {
    const address = provider.publicKey?.toBase58()

    return address
  }
}
