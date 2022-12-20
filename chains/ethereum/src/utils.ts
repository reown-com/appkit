import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from './types'

// -- constants ------------------------------------------------------- //
export const NAMESPACE = 'eip155'

// -- providers ------------------------------------------------------- //
export function walletConnectProvider({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider({
    rpc: chain => {
      const supportedChains = [1, 137, 10, 42161, 1313161554, 11297108109, 43114, 42220]

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
export function modalConnectors({ appName, chains }: ModalConnectorsOpts) {
  return [
    new WalletConnectConnector({ chains, options: { qrcode: false } }),
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true, shimChainChangedDisconnect: true }
    }),
    new CoinbaseWalletConnector({ chains, options: { appName } })
  ]
}
