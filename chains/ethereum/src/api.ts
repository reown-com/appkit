import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { AccountCtrl } from '@web3modal/core'
import type {
  EthereumClient,
  GetDefaultConnectorsOpts,
  GetWalletConnectProviderOpts
} from '../types/apiTypes'

// -- constants ---------------------------------------------------- //
const NAMESPACE = 'eip155'

// -- private ------------------------------------------------------ //
let ethereumClient = undefined as EthereumClient | undefined

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
    const account = ethereumClient.data?.account
    const chain = ethereumClient.data?.chain

    // Populate connected data
    if (account && chain) AccountCtrl.setAccount(account, `${NAMESPACE}:${chain.id}`)

    // Preheat connectors
    const walletConnect = this.getConnectorById('walletConnect')
    const coinbase = this.getConnectorById('coinbaseWallet')
    walletConnect.connect()
    coinbase.connect()

    return this
  },

  // -- connectors ------------------------------------------------- //
  getConnectorById(id: 'coinbaseWallet' | 'injected' | 'metaMask' | 'walletConnect') {
    const connector = ethereumClient?.connectors.find(item => item.id === id)
    if (!connector) throw new Error(`Missing ${id} connector`)

    return connector
  },

  disconnect() {
    ethereumClient?.connectors.forEach(async connector => connector.disconnect())
    AccountCtrl.resetAccount()
  },

  async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('walletConnect')

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
    AccountCtrl.setAccount(data.account, `${NAMESPACE}:${data.chain.id}`)

    return data
  },

  async connectCoinbase(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('coinbaseWallet')

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
    AccountCtrl.setAccount(data.account, `${NAMESPACE}:${data.chain.id}`)

    return data
  },

  async connectMetaMask() {
    const connector = this.getConnectorById('metaMask')
    const data = await connector.connect()
    AccountCtrl.setAccount(data.account, `${NAMESPACE}:${data.chain.id}`)

    return data
  },

  async connectInjected() {
    const connector = this.getConnectorById('injected')
    const data = await connector.connect()
    AccountCtrl.setAccount(data.account, `${NAMESPACE}:${data.chain.id}`)

    return data
  }
}
