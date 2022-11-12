import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from '../types/apiTypes'

// -- constants ------------------------------------------------------- //
const NAMESPACE = 'eip155'

// -- providers ------------------------------------------------------- //
export function walletConnectProvider({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider({
    rpc: rpcChain => ({
      http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${rpcChain.id}&projectId=${projectId}`
    })
  })
}

// -- connectors ------------------------------------------------------ //
export function modalConnectors({ appName, chains: connectorChains }: ModalConnectorsOpts) {
  return [
    new WalletConnectConnector({ chains: connectorChains, options: { qrcode: false } }),
    new InjectedConnector({ chains: connectorChains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains: connectorChains,
      options: { appName, headlessMode: true }
    }),
    new MetaMaskConnector({
      chains: connectorChains,
      options: {
        shimDisconnect: true,
        shimChainChangedDisconnect: false,
        UNSTABLE_shimOnConnectSelectAccount: true
      }
    })
  ]
}
