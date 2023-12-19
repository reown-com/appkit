import type { ChainProviderFn } from '@wagmi/core'
import type { Chain } from 'viem/chains'
import { CoreHelperUtil } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'

// -- Helpers ------------------------------------------------------------------
const RPC_URL = CoreHelperUtil.getBlockchainApiUrl()

// -- Types --------------------------------------------------------------------
interface Options {
  projectId: string
}

// -- Provider -----------------------------------------------------------------
export function walletConnectProvider<C extends Chain = Chain>({
  projectId
}: Options): ChainProviderFn<C> {
  return function provider(chain) {
    if (!PresetsUtil.WalletConnectRpcChainIds.includes(chain.id)) {
      return null
    }

    const baseHttpUrl = `${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chain.id}&projectId=${projectId}`

    return {
      chain: {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: { http: [baseHttpUrl] }
        }
      } as C,
      rpcUrls: {
        http: [baseHttpUrl]
      }
    }
  }
}
