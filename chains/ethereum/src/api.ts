import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type {
  EthereumClient,
  GetDefaultConnectorsOpts,
  GetWalletConnectProviderOpts
} from '../types/apiTypes'

// -- private ------------------------------------------------------ //
let client = undefined as EthereumClient | undefined

function getWalletConnectConnector() {
  const walletConnect = client?.connectors.find(item => item.id === 'walletConnect')
  if (!walletConnect) throw new Error('Missing WalletConnect connector')

  return walletConnect
}

function getInjectedConnector() {
  const injected = client?.connectors.find(item => item.id === 'injected')
  if (!injected) throw new Error('Missing Injected connector')

  return injected
}

// -- public ------------------------------------------------------- //
export const Web3ModalEthereum = {
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
      new CoinbaseWalletConnector({ chains, options: { appName } }),
      new MetaMaskConnector({ chains })
    ]
  },

  createClient(wagmiClient: EthereumClient) {
    client = wagmiClient
    // Warm up WalletConnect connector
    const walletConnect = getWalletConnectConnector()
    walletConnect.connect()

    return this
  },

  async connectWalletConnect(onUri: (uri: string) => void) {
    const walletConnect = getWalletConnectConnector()

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        walletConnect.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const { connector } = await walletConnect.getProvider()
            if (connector.key) {
              onUri(connector.uri)
              resolve()
            }
          }
        })
      })
    }

    const [data] = await Promise.all([walletConnect.connect(), getProviderUri()])

    return data
  },

  async disconnectWalletConnect() {
    const walletConnect = getWalletConnectConnector()

    return walletConnect.disconnect()
  },

  async connectInject() {
    const injected = getInjectedConnector()

    return injected.connect()
  }
}
