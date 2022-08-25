import { Chain, createClient, InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'

import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'

export const Web3ModalEthereum = {
  client: undefined as unknown as WagmiClient,

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
  },

  createClient(wagmiClient: unknown) {
    this.client = wagmiClient as WagmiClient

    return this.client
  }
}

/**
 * Expose global api for vanilla js
 */
if (typeof window !== 'undefined') window.Web3ModalEthereum = Web3ModalEthereum

type WagmiClient = ReturnType<typeof createClient>

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
