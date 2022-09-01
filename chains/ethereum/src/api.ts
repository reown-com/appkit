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
let ethereumClient = undefined as EthereumClient | undefined

function getWalletConnectConnector() {
  const connector = ethereumClient?.connectors.find(item => item.id === 'walletConnect')
  if (!connector) throw new Error('Missing WalletConnect connector')

  return connector
}

function getCoinbaseConnector() {
  const connector = ethereumClient?.connectors.find(item => item.id === 'coinbaseWallet')
  if (!connector) throw new Error('Missing Coinbase Wallet connector')

  return connector
}

// -- public ------------------------------------------------------- //
export const Web3ModalEthereum = {
  walletConnectRpc({ projectId }: GetWalletConnectProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => ({
        http: `https://rpc.walletconnect.com/v1/?chainId=eip155:${chain.id}&projectId=${projectId}`
      })
    })
  },

  defaultConnectors({ appName, chains }: GetDefaultConnectorsOpts) {
    return [
      new WalletConnectConnector({ chains, options: { qrcode: false } }),
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName, headlessMode: true } }),
      new MetaMaskConnector({ chains })
    ]
  },

  createClient(wagmiClient: EthereumClient) {
    ethereumClient = wagmiClient
    // Preheat connectors
    const walletConnect = getWalletConnectConnector()
    const coinbase = getCoinbaseConnector()
    walletConnect.connect()
    coinbase.connect()

    return this
  },

  // -- connectors ------------------------------------------------- //
  disconnect() {
    ethereumClient?.connectors.forEach(async connector => connector.disconnect())
  },

  async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = getWalletConnectConnector()

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const provider = await connector.getProvider()
            onUri(provider.connector.uri)
            resolve()
          }
        })
      })
    }

    const [data] = await Promise.all([connector.connect(), getProviderUri()])

    return data
  },

  async connectCoinbase(onUri: (uri: string) => void) {
    const connector = getCoinbaseConnector()

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const provider = await connector.getProvider()
            onUri(provider.qrUrl)
            resolve()
          }
        })
      })
    }

    const [data] = await Promise.all([connector.connect(), getProviderUri()])

    return data
  },

  getMetaMaskConnector() {
    const connector = ethereumClient?.connectors.find(item => item.id === 'metaMask')
    if (!connector) throw new Error('Missing MetaMask connector')

    return connector
  },

  async connectMetaMask() {
    const connector = this.getMetaMaskConnector()

    return connector.connect()
  },

  getInjectedConnector() {
    const connector = ethereumClient?.connectors.find(item => item.id === 'injected')
    if (!connector) throw new Error('Missing Injected connector')

    return connector
  },

  async connectInject() {
    const connector = this.getInjectedConnector()

    return connector.connect()
  }
}
