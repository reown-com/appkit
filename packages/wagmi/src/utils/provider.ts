import type { Chain, ChainProviderFn } from '@wagmi/core'
import { BLOCKCHAIN_HTTP_API, BLOCKCHAIN_WSS_API, NAMESPACE } from './constants.js'

interface Options {
  projectId: string
}

export function walletConnectProvider<C extends Chain = Chain>({
  projectId
}: Options): ChainProviderFn<C> {
  return function provider(chain) {
    const supportedWss = [1, 5, 10, 69, 420, 42161, 42220, 421613, 1313161554, 1313161555]

    const supportedHttp = [
      ...supportedWss,
      3,
      4,
      42,
      56,
      97,
      100,
      137,
      280,
      324,
      8453,
      43114,
      80001,
      421611,
      7777777,
      11155111
    ]

    if (!supportedHttp.includes(chain.id)) {
      return null
    }

    const baseHttpUrl = `${BLOCKCHAIN_HTTP_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
    let baseWssUrl = undefined

    if (supportedWss.includes(chain.id)) {
      baseWssUrl = `${BLOCKCHAIN_WSS_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
    }

    return {
      chain: {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: { http: [baseHttpUrl] }
        }
      } as C,
      rpcUrls: {
        http: [baseHttpUrl],
        webSocket: baseWssUrl ? [baseWssUrl] : undefined
      }
    }
  }
}
