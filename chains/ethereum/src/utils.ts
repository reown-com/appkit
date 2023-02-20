import { WalletConnectConnector } from '@wagmi/connectors/walletConnect'
import { WalletConnectV1Connector } from '@wagmi/connectors/walletConnectV1'
import type { Chain, Connector } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from './types'

// -- constants ------------------------------------------------------- //
export const NAMESPACE = 'eip155'

// -- providers ------------------------------------------------------- //
export function walletConnectProvider<C extends Chain>({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider<C>({
    rpc: chain => {
      const supportedChains = [
        1, 3, 4, 5, 10, 42, 56, 69, 97, 100, 137, 420, 42161, 42220, 43114, 80001, 421611, 421613,
        1313161554, 11297108109
      ]

      if (supportedChains.includes(chain.id)) {
        return {
          http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
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
export function modalConnectors({ chains, version, projectId }: ModalConnectorsOpts) {
  const isV1 = version === 1

  const connectors: Connector[] = [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true, shimChainChangedDisconnect: true }
    })
  ]

  if (isV1) {
    connectors.unshift(
      // @ts-expect-error TODO(ilja)
      new WalletConnectV1Connector({
        chains,
        options: { qrcode: false }
      })
    )
  } else {
    connectors.unshift(
      // @ts-expect-error TODO(ilja)
      new WalletConnectConnector({
        chains,
        options: { qrcode: false, projectId }
      })
    )
  }

  return connectors
}
