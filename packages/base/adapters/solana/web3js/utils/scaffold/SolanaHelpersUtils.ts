import { PresetsUtil, ConstantsUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil, type CaipNetworkId } from '@web3modal/common'
import type { Chain } from '@web3modal/scaffold-utils'
import type { CaipNetwork } from '@web3modal/core'

import { SolConstantsUtil } from './SolanaConstantsUtil.js'
import type { SolanaProvider } from './SolanaTypesUtil.js'
import type { ExtendedBaseWalletAdapter } from '../../client.js'
import type { SolStoreUtilState } from './SolanaStoreUtil.js'
import type { Network } from '../../../../../utils/StoreUtil.js'

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
        imageId: PresetsUtil.EIP155NetworkImageIds[chainId],
        chain: CommonConstantsUtil.CHAIN.SOLANA
      }
    }

    return {
      ...SolConstantsUtil.DEFAULT_CHAIN,
      id: `solana:${chainId}` as CaipNetworkId,
      chainId: `solana:${chainId}` as CaipNetworkId,
      imageId: PresetsUtil.EIP155NetworkImageIds[chainId],
      chain: CommonConstantsUtil.CHAIN.SOLANA
    }
  },

  getCaipDefaultChain(chain?: Chain) {
    if (!chain) {
      return undefined
    }

    return {
      id: `solana:${chain.chainId}`,
      name: chain.name,
      imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
    } as CaipNetwork
  },

  hexStringToNumber(value: string) {
    const hexString = value.startsWith('0x') ? value.slice(2) : value
    const decimalValue = parseInt(hexString, 16)

    return decimalValue
  },

  async getAddress(provider: SolanaProvider) {
    const [address] = await provider.request<string[]>({ method: 'getAccountInfo' })

    return address
  },

  getStorageInjectedId: (adapter: ExtendedBaseWalletAdapter) =>
    (adapter.isAnnounced
      ? `${ConstantsUtil.WALLET_STANDARD_CONNECTOR_ID}_${adapter.name}`
      : `${ConstantsUtil.INJECTED_CONNECTOR_ID}_${adapter.name}`) as unknown as Exclude<
      SolStoreUtilState['providerType'],
      undefined
    >
}
