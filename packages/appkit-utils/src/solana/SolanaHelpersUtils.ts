import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { SolConstantsUtil } from './SolanaConstantsUtil.js'
import type { Provider } from './SolanaTypesUtil.js'

export const SolHelpersUtil = {
  detectRpcUrl(chain: CaipNetwork, projectId: string) {
    if (
      chain.rpcUrls.default.http[0]?.includes(
        new URL(CommonConstantsUtil.BLOCKCHAIN_API_RPC_URL).hostname
      )
    ) {
      return `${chain.rpcUrls.default.http[0]}?chainId=solana:${chain.id}&projectId=${projectId}`
    }

    return chain.rpcUrls.default.http[0]
  },

  getChain(chains: CaipNetwork[], chainId: string | null) {
    const chain = chains.find(lChain => lChain.id === chainId)

    if (chain) {
      return chain
    }

    return SolConstantsUtil.DEFAULT_CHAIN
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
