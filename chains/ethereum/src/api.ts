import { Chain, InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'

const Web3ModalEthereum = {
  getWalletConnectProvider({ projectId }: GetWalletConnectProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => ({
        http: `https://rpc.walletconnect.com/v1/?chainId=eip155:${chain.id}&projectId=${projectId}`
      })
    })
  },

  getDefaultConnectors({ appName, chains }: GetDefaultConnectorsOpts) {
    return [
      new WalletConnectConnector({ chains, options: { qrcode: false } }),
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName } })
    ]
  }
}

export default Web3ModalEthereum

/**
 * Expose global api for vanilla js
 */
window.Web3ModalEthereum = Web3ModalEthereum

interface GetDefaultConnectorsOpts {
  appName: string
  chains: Chain[]
}

interface GetWalletConnectProviderOpts {
  projectId: string
}

declare global {
  interface Window {
    Web3ModalEthereum: typeof Web3ModalEthereum
  }
}
