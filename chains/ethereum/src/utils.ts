import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import type { Chain } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from './types'

// -- constants ------------------------------------------------------- //
export const NAMESPACE = 'eip155'
export const BLOCKCHAIN_API = 'https://rpc.walletconnect.com'

// -- providers ------------------------------------------------------- //
export function w3mProvider<C extends Chain>({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider<C>({
    rpc: chain => {
      const supportedChains = [
        1, 3, 4, 5, 10, 42, 56, 69, 97, 100, 137, 280, 324, 420, 42161, 42220, 43114, 80001, 421611,
        421613, 1313161554, 1313161555
      ]

      if (supportedChains.includes(chain.id)) {
        return {
          http: `${BLOCKCHAIN_API}/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
        }
      }

      return {
        http: chain.rpcUrls.default.http[0],
        webSocket: chain.rpcUrls.default.webSocket?.[0]
      }
    }
  })
}

// -- connectors ------------------------------------------------------ //
export function w3mConnectors({ chains, projectId }: ModalConnectorsOpts) {
  return [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false }
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } })
  ]
}
