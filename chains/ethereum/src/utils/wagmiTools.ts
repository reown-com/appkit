import { chain, InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from '../../types/apiTypes'
import {
  avalanche,
  avalancheFuji,
  binanceSmartChain,
  binanceSmartChainTestnet,
  fantom,
  fantomTestnet
} from './chains'

// -- constants ------------------------------------------------------- //
const NAMESPACE = 'eip155'

// -- utilities ------------------------------------------------------- //
const customChains = [
  avalanche,
  avalancheFuji,
  binanceSmartChain,
  binanceSmartChainTestnet,
  fantom,
  fantomTestnet
]

// -- providers ------------------------------------------------------- //
function walletConnectProvider({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider({
    rpc: rpcChain => {
      const customChain = customChains.find(c => c.id === rpcChain.id)

      if (customChain)
        return {
          http: customChain.rpcUrls.default
        }

      return {
        http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${rpcChain.id}&projectId=${projectId}`
      }
    }
  })
}

export const modalProviders = {
  alchemyProvider,
  infuraProvider,
  jsonRpcProvider,
  publicProvider,
  walletConnectProvider
}

// -- chains ---------------------------------------------------------- //

export const modalChains = {
  ...chain,
  avalanche,
  fantom,
  binanceSmartChain,
  avalancheFuji,
  fantomTestnet,
  binanceSmartChainTestnet
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
