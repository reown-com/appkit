import type { Chain, ChainProviderFn } from '@wagmi/core'
import { BLOCKCHAIN_API, NAMESPACE } from './constants.js'

interface Options {
  projectId: string
}

export function walletConnectProvider<C extends Chain = Chain>({
  projectId
}: Options): ChainProviderFn<C> {
  return function provider(chain) {
    const supported = [
      1, 3, 4, 5, 10, 42, 56, 69, 97, 100, 137, 280, 324, 420, 42161, 42220, 43114, 80001, 421611,
      421613, 1313161554, 1313161555, 7777777, 8453
    ]

    if (!supported.includes(chain.id)) {
      return null
    }

    const baseHttpUrl = `${BLOCKCHAIN_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`

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
