import type { Chain, ChainProviderFn } from '@wagmi/core'
import { BLOCKCHAIN_HTTP_API, NAMESPACE } from './constants.js'

interface Options {
  projectId: string
}

export function walletConnectProvider<C extends Chain = Chain>({
  projectId
}: Options): ChainProviderFn<C> {
  return function provider(chain) {
    const supported = [
      1, 5, 10, 69, 420, 999, 42161, 42220, 421613, 1313161554, 1313161555, 3, 4, 42, 56, 97, 100,
      137, 280, 324, 8453, 43114, 84531, 80001, 421611, 7777777, 11155111
    ]

    if (!supported.includes(chain.id)) {
      return null
    }

    const baseHttpUrl = `${BLOCKCHAIN_HTTP_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`

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
