import type { Chain } from '@wagmi/core'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { BLOCKCHAIN_API, NAMESPACE } from './constants.js'

interface Options {
  projectId: string
}

export function walletConnectProvider<C extends Chain>({ projectId }: Options) {
  return jsonRpcProvider<C>({
    rpc: chain => {
      const supported = [
        1, 3, 4, 5, 10, 42, 56, 69, 97, 100, 137, 280, 324, 420, 42161, 42220, 43114, 80001, 421611,
        421613, 1313161554, 1313161555
      ]

      if (supported.includes(chain.id)) {
        return {
          http: `${BLOCKCHAIN_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
        }
      }

      return {
        http: chain.rpcUrls.default.http[0] ?? '',
        webSocket: chain.rpcUrls.default.webSocket?.[0]
      }
    }
  })
}
