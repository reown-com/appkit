import { http } from '@wagmi/core'
import type { Chain } from '@wagmi/core/chains'
import type { HttpTransport } from 'viem'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'

// -- Helpers ------------------------------------------------------------------
const RPC_URL = CoreHelperUtil.getBlockchainApiUrl()

// -- Types --------------------------------------------------------------------
interface Options {
  projectId: string
}

// -- Provider -----------------------------------------------------------------
export function walletConnectProvider({
  projectId
}: Options): (chain: Chain) => HttpTransport | null {
  return function provider(chain: Chain): HttpTransport | null {
    if (!PresetsUtil.WalletConnectRpcChainIds.includes(chain.id)) {
      return null
    }

    const baseHttpUrl = `${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chain.id}&projectId=${projectId}`

    return http(baseHttpUrl)
  }
}
