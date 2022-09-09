import type { Connector } from '@wagmi/core'
import { fetchSigner, getNetwork, signTypedData } from '@wagmi/core'
import { fetchBalance } from '@wagmi/core'
import { connect, disconnect, InjectedConnector, switchNetwork } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type {
  EthereumClient,
  GetBalanceOpts,
  GetDefaultConnectorsOpts,
  GetWalletConnectProviderOpts,
  SignTypedDataOpts
} from '../types/apiTypes'
import { ethereumClient, getChainIdReference, initClient, NAMESPACE } from './utilities'

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

    // Preheat wc connector
    const walletConnect = this.getConnectorById('walletConnect')
    walletConnect.connect()

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

  async connectLedgerDesktop(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('walletConnect')
    const chainId = this.getDefaultConnectorChainId(connector)

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const provider = await connector.getProvider()
            const wcUri: string = provider.connector.uri
            onUri(`ledgerlive://wc?uri=${encodeURIComponent(wcUri)}`)
            resolve()
          }
        })
      })
    }

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectCoinbaseMobile(onUri: (uri: string) => void) {
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

  async connectCoinbaseExtension() {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

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
    const chain = await switchNetwork({ chainId: getChainIdReference(chainId) })

    return chain
  },

  async signTypedData({ value, domain, types }: SignTypedDataOpts) {
    await signTypedData({ value, domain, types })
  },

  // -- fetch ------------------------------------------------------- //
  async fetchBalance({ address, chainId, formatUnits }: GetBalanceOpts) {
    const balance = await fetchBalance({
      addressOrName: address,
      chainId: getChainIdReference(chainId),
      formatUnits
    })

    return balance.formatted
  },

  async fetchSigner() {
    const signer = await fetchSigner()

    return signer
  },

  async getNetwork() {
    const network = await Promise.resolve(getNetwork())

    return network
  }
}
