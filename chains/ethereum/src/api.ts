import type { Connector } from '@wagmi/core'
import {
  connect,
  disconnect,
  fetchBalance,
  fetchEnsAddress,
  fetchEnsAvatar,
  fetchEnsName,
  fetchEnsResolver,
  fetchSigner,
  fetchToken,
  fetchTransaction,
  getContract,
  getNetwork,
  InjectedConnector,
  prepareSendTransaction,
  prepareWriteContract,
  readContract,
  sendTransaction,
  signMessage,
  signTypedData,
  switchNetwork,
  waitForTransaction,
  watchReadContract,
  writeContract
} from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { CoreHelpers } from '@web3modal/core'
import type {
  EthereumClient,
  FetchEnsAddressOpts,
  FetchEnsAvatarOpts,
  FetchEnsNameOpts,
  FetchTransactionOpts,
  GetBalanceOpts,
  GetContractOpts,
  GetDefaultConnectorsOpts,
  GetTokenOpts,
  GetWalletConnectProviderOpts,
  PrepareSendTransactionOpts,
  PrepareWriteContractOpts,
  ReadContractOpts,
  SignTypedDataOpts,
  WaitForTransactionOpts,
  WatchReadContractOpts,
  WriteContractOpts
} from '../types/apiTypes'
import { formatOpts, getChainIdReference, getClient, initClient, NAMESPACE } from './utilities'

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
    await disconnect()
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

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

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

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

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

    return `eip155:${chain.id}`
  },

  async signTypedData({ value, domain, types }: SignTypedDataOpts) {
    const signature = await signTypedData({ value, domain, types })

    return signature
  },

  async signMessage(message: string) {
    const signature = await signMessage({ message })

    return signature
  },

  // -- fetch ------------------------------------------------------- //
  async fetchBalance(opts: GetBalanceOpts) {
    const balance = await fetchBalance(formatOpts(opts))

    return balance.formatted
  },

  async fetchSigner() {
    const signer = await fetchSigner()

    return signer
  },

  getNetwork() {
    const network = getNetwork()

    return network
  },

  // ----------- contract ----------------------------- //

  getContract({ addressOrName, contractInterface, signerOrProvider }: GetContractOpts) {
    const contract = getContract({ addressOrName, contractInterface, signerOrProvider })

    return contract
  },

  async getToken({ address, chainId, formatUnits }: GetTokenOpts) {
    const token = await fetchToken({ address, chainId: getChainIdReference(chainId), formatUnits })

    return token
  },

  async readContract(opts: ReadContractOpts) {
    const read = await readContract(formatOpts(opts))

    return read
  },

  async writeContract(opts: WriteContractOpts) {
    const write = await writeContract(
      formatOpts({
        mode: 'prepared',
        ...opts
      })
    )

    return write
  },

  async prepareWriteContract(opts: PrepareWriteContractOpts) {
    const preperation = await prepareWriteContract(formatOpts(opts))

    return preperation
  },

  watchReadContract(opts: WatchReadContractOpts) {
    const { callback, ...remainingOpts } = opts
    watchReadContract(formatOpts(remainingOpts), callback)
  },

  // ----------- ens ----------------------------- //

  async fetchEnsAddress(opts: FetchEnsAddressOpts) {
    const address = await fetchEnsAddress(formatOpts(opts))

    return address?.toString()
  },

  async fetchEnsAvatar(opts: FetchEnsAvatarOpts) {
    const avatar = await fetchEnsAvatar(formatOpts(opts))

    return avatar?.toString()
  },

  async fetchEnsName(opts: FetchEnsNameOpts) {
    const name = await fetchEnsName(formatOpts(opts))

    return name?.toString()
  },

  async fetchEnsResolver(opts: FetchEnsAddressOpts) {
    const resolver = await fetchEnsResolver(formatOpts(opts))

    return resolver
  },

  // ----------- transaction ---------------------- //

  async fetchTransaction(opts: FetchTransactionOpts) {
    const transaction = await fetchTransaction(formatOpts(opts))

    return transaction
  },

  async prepareSendTransaction(opts: PrepareSendTransactionOpts) {
    const preparation = await prepareSendTransaction(formatOpts(opts))

    return preparation
  },

  async sendTransaction(opts: PrepareSendTransactionOpts) {
    const prep = await prepareSendTransaction(formatOpts(opts))
    const result = await sendTransaction({
      mode: 'prepared',
      request: prep.request
    })

    return result
  },

  async waitForTransaction(opts: WaitForTransactionOpts) {
    const receipt = await waitForTransaction(formatOpts(opts))

    return receipt
  }
}
