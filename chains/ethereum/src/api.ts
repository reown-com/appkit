import * as wagmi from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'

const Web3ModalEthereum = {
  wagmi,
  connectors: {
    injected: wagmi.InjectedConnector,
    coinbase: CoinbaseWalletConnector,
    walletConnect: WalletConnectConnector,
    metamask: MetaMaskConnector
  },
  providers: { publicProvider }
}

export default Web3ModalEthereum

/**
 * Expose global api for vanilla js
 */
window.Web3Modal.ethereum = Web3ModalEthereum

declare global {
  interface Window {
    Web3Modal: {
      ethereum: typeof Web3ModalEthereum
    }
  }
}
