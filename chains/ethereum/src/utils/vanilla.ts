import * as wagmi from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import { Web3ModalEthereum } from '../api'

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

if (typeof window !== 'undefined') {
  window.Web3ModalEthereum = Web3ModalEthereum
  window.Wagmi = Wagmi
}

declare global {
  interface Window {
    Wagmi: typeof Wagmi
    Web3ModalEthereum: typeof Web3ModalEthereum
  }
}
