import type { Connector } from '@wagmi/core'
import * as WagmiCore from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { CoreHelpers } from '@web3modal/core'
import type * as ApiTypes from '../types/apiTypes'
import { formatOpts, getChainIdReference, getClient, initClient, NAMESPACE } from './utilities'

export const Web3ModalEthereum = {
  // -- config ------------------------------------------------------- //
  walletConnectRpc({ projectId }: ApiTypes.GetWalletConnectProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => ({
        http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
      })
    })
  },

  defaultConnectors({ appName, chains }: ApiTypes.GetDefaultConnectorsOpts) {
    return [
      new WalletConnectConnector({ chains, options: { qrcode: false } }),
      new WagmiCore.InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName, headlessMode: true } }),
      new MetaMaskConnector({ chains })
    ]
  },

  createClient(wagmiClient: ApiTypes.EthereumClient) {
    initClient(wagmiClient)

    return this
  },

  // -- chains ----------------------------------------------------- //
  getDefaultConnectorChainId(connector: Connector) {
    const chainId = connector.chains[0].id

    return chainId
  },

  // -- connectors ------------------------------------------------- //
  getConnectorById(id: 'coinbaseWallet' | 'injected' | 'metaMask' | 'walletConnect') {
    const connector = getClient()?.connectors.find(item => item.id === id)
    if (!connector) throw new Error(`Missing ${id} connector`)

    return connector
  },

  async disconnect() {
    await WagmiCore.disconnect()
    CoreHelpers.removeWalletConnectDeepLink()
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

    const [data] = await Promise.all([WagmiCore.connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectLinking(onUri: (uri: string) => void) {
    const connector = this.getConnectorById('walletConnect')
    const chainId = this.getDefaultConnectorChainId(connector)

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const provider = await connector.getProvider()
            const wcUri: string = provider.connector.uri
            onUri(encodeURIComponent(wcUri))
            resolve()
          }
        })
      })
    }

    const [data] = await Promise.all([WagmiCore.connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectCoinbaseMobile(onUri?: (uri: string) => void) {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = this.getDefaultConnectorChainId(connector)

    async function getProviderUri() {
      return new Promise<void>(resolve => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const provider = await connector.getProvider()
            onUri?.(provider.qrUrl)
            resolve()
          }
        })
      })
    }

    const [data] = await Promise.all([WagmiCore.connect({ connector, chainId }), getProviderUri()])

    return data
  },

  async connectCoinbaseExtension() {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await WagmiCore.connect({ connector, chainId })

    return data
  },

  async connectMetaMask() {
    const connector = this.getConnectorById('metaMask')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await WagmiCore.connect({ connector, chainId })

    return data
  },

  async connectInjected() {
    const connector = this.getConnectorById('injected')
    const chainId = this.getDefaultConnectorChainId(connector)
    const data = await WagmiCore.connect({ connector, chainId })

    return data
  },

  // -- actions ----------------------------------------------------- //
  async switchChain(chainId: string) {
    const chain = await WagmiCore.switchNetwork({ chainId: getChainIdReference(chainId) })

    return `eip155:${chain.id}`
  },

  async signTypedData({ value, domain, types }: ApiTypes.SignTypedDataOpts) {
    const signature = await WagmiCore.signTypedData({ value, domain, types })

    return signature
  },

  async signMessage(message: string) {
    const signature = await WagmiCore.signMessage({ message })

    return signature
  },

  // -- fetch ------------------------------------------------------- //
  async fetchBalance(opts: ApiTypes.GetBalanceOpts) {
    const balance = await WagmiCore.fetchBalance(formatOpts(opts))

    return balance.formatted
  },

  async fetchSigner() {
    const signer = await WagmiCore.fetchSigner()

    return signer
  },

  getNetwork() {
    const network = WagmiCore.getNetwork()

    return network
  },

  // ----------- contract ----------------------------- //

  getContract({ addressOrName, contractInterface, signerOrProvider }: ApiTypes.GetContractOpts) {
    const contract = WagmiCore.getContract({ addressOrName, contractInterface, signerOrProvider })

    return contract
  },

  async getToken({ address, chainId, formatUnits }: ApiTypes.GetTokenOpts) {
    const token = await WagmiCore.fetchToken({
      address,
      chainId: getChainIdReference(chainId),
      formatUnits
    })

    return token
  },

  async readContract(opts: ApiTypes.ReadContractOpts) {
    const read = await WagmiCore.readContract(formatOpts(opts))

    return read
  },

  async writeContract(opts: ApiTypes.WriteContractOpts) {
    const write = await WagmiCore.writeContract(
      formatOpts({
        mode: 'prepared',
        ...opts
      })
    )

    return write
  },

  async prepareWriteContract(opts: ApiTypes.PrepareWriteContractOpts) {
    const preperation = await WagmiCore.prepareWriteContract(formatOpts(opts))

    return preperation
  },

  watchReadContract(opts: ApiTypes.WatchReadContractOpts) {
    const { callback, ...remainingOpts } = opts
    WagmiCore.watchReadContract(formatOpts(remainingOpts), callback)
  },

  // ----------- ens ----------------------------- //

  async fetchEnsAddress(opts: ApiTypes.FetchEnsAddressOpts) {
    const address = await WagmiCore.fetchEnsAddress(formatOpts(opts))

    return address?.toString()
  },

  async fetchEnsAvatar(opts: ApiTypes.FetchEnsAvatarOpts) {
    const avatar = await WagmiCore.fetchEnsAvatar(formatOpts(opts))

    return avatar?.toString()
  },

  async fetchEnsName(opts: ApiTypes.FetchEnsNameOpts) {
    const name = await WagmiCore.fetchEnsName(formatOpts(opts))

    return name?.toString()
  },

  async fetchEnsResolver(opts: ApiTypes.FetchEnsAddressOpts) {
    const resolver = await WagmiCore.fetchEnsResolver(formatOpts(opts))

    return resolver
  },

  // ----------- transaction ---------------------- //

  async fetchTransaction(opts: ApiTypes.FetchTransactionOpts) {
    const transaction = await WagmiCore.fetchTransaction(formatOpts(opts))

    return transaction
  },

  async prepareSendTransaction(opts: ApiTypes.PrepareSendTransactionOpts) {
    const preparation = await WagmiCore.prepareSendTransaction(formatOpts(opts))

    return preparation
  },

  async sendTransaction(opts: ApiTypes.PrepareSendTransactionOpts) {
    const prep = await WagmiCore.prepareSendTransaction(formatOpts(opts))
    const result = await WagmiCore.sendTransaction({
      mode: 'prepared',
      request: prep.request
    })

    return result
  },

  async waitForTransaction(opts: ApiTypes.WaitForTransactionOpts) {
    const receipt = await WagmiCore.waitForTransaction(formatOpts(opts))

    return receipt
  }
}
