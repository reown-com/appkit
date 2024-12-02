import { getPublicClient } from '@wagmi/core'
import { ChainId, wagmiConfig } from '../core/wagmi'

export const ProviderUtil = {
  createPublicClient(chainId: ChainId) {
    return getPublicClient(wagmiConfig, { chainId })
  }
}
