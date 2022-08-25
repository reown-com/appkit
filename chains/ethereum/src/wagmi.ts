import * as wagmi from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'

const Wagmi = {
  ...wagmi,
  connectors: {
    injected: wagmi.InjectedConnector,
    coinbase: CoinbaseWalletConnector,
    walletConnect: WalletConnectConnector,
    metamask: MetaMaskConnector
  },
  providers: { jsonRpcProvider, alchemyProvider, infuraProvider, publicProvider }
}

/**
 * Expose global api for vanilla js
 */
if (typeof window !== 'undefined') window.Wagmi = Wagmi

declare global {
  interface Window {
    Wagmi: typeof Wagmi
  }
}
