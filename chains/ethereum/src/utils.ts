import type { Chain } from '@wagmi/core'
import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
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
export function modalConnectors({ appName, chains, version, projectId }: ModalConnectorsOpts) {
  const walletConnectVersion = version ?? '1'
  if (walletConnectVersion === '2' && !projectId) {
    throw new Error('modalConnectors() requires projectId for WalletConnect version 2')
  }

  return [
    new WalletConnectConnector({
      chains,
      // @ts-expect-error - projectId is checked above
      options: { qrcode: false, version: walletConnectVersion, projectId }
    }),
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true, shimChainChangedDisconnect: true }
    }),
    new CoinbaseWalletConnector({ chains, options: { appName } })
  ]
}
