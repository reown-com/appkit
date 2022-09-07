import type { Connector } from '@wagmi/core'
import { connect, disconnect, InjectedConnector, switchNetwork } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type {
  EthereumClient,
  GetDefaultConnectorsOpts,
  GetWalletConnectProviderOpts
} from '../types/apiTypes'
import { ethereumClient, initClient, NAMESPACE } from './utilities'

export const Web3ModalEthereum = {
  // -- config ------------------------------------------------------- //
  walletConnectRpc({ projectId }: GetWalletConnectProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => ({
        http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
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
    initClient(wagmiClient)

    // Preheat connectors
    const walletConnect = this.getConnectorById('walletConnect')
    const coinbase = this.getConnectorById('coinbaseWallet')
    walletConnect.connect()
    coinbase.connect()

    return this
  },

  // -- chains ----------------------------------------------------- //
  getDefaultConnectorChainId(connector: Connector) {
    const chainId = connector.chains[0].id

    return chainId
  },

  // -- connectors ------------------------------------------------- //
  getConnectorById(id: 'coinbaseWallet' | 'injected' | 'metaMask' | 'walletConnect') {
    const connector = ethereumClient?.connectors.find(item => item.id === id)
    if (!connector) throw new Error(`Missing ${id} connector`)

    return connector
  },

  async disconnect() {
    return disconnect()
  },

  async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('walletConnect')
    const chainId = this.getDefaultConnectorChainId(connector)

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

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectCoinbase(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = this.getDefaultConnectorChainId(connector)

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

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectMetaMask() {
    const connector = this.getConnectorById('metaMask')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  },

  async connectInjected() {
    const connector = this.getConnectorById('injected')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  },

  // -- actions ----------------------------------------------------- //
  async switchChain(chainId: string) {
    if (typeof chainId === 'string' && chainId.includes(':')) {
      const id = Number(chainId.split(':')[1])
      const chain = await switchNetwork({ chainId: id })

      return chain
    }

    throw new Error('Invalid chainId, should be formated as namespace:id')
  }
}
