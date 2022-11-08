import type { Connector } from '@wagmi/core'
import {
  connect,
  disconnect,
  fetchBalance,
  fetchBlockNumber,
  fetchEnsAddress,
  fetchEnsAvatar,
  fetchEnsName,
  fetchEnsResolver,
  fetchFeeData,
  fetchSigner,
  fetchToken,
  fetchTransaction,
  getAccount,
  getContract,
  getNetwork,
  getProvider,
  getWebSocketProvider,
  prepareSendTransaction,
  prepareWriteContract,
  readContract,
  sendTransaction,
  signMessage,
  signTypedData,
  switchNetwork,
  waitForTransaction,
  watchAccount,
  watchBlockNumber,
  watchContractEvent,
  watchNetwork,
  watchProvider,
  watchReadContract,
  watchSigner,
  watchWebSocketProvider,
  writeContract
} from '@wagmi/core'
import type { EthereumOptions } from '../types/apiTypes'
import { getClient, initializeClient } from './utils/wagmiHelpers'

export const Web3ModalEthereum = {
  // -- config ------------------------------------------------------- //
  createClient(projectId: string, options: EthereumOptions) {
    const { configChains, configProviders } = initializeClient(projectId, options)

    return {
      client: this,
      configChains,
      configProviders
    }
  },

  // -- chains ------------------------------------------------------- //
  getDefaultConnectorChainId(connector: Connector) {
    const chainId = connector.chains[0].id

    return chainId
  },

  // -- connectors --------------------------------------------------- //
  getConnectorById(id: 'coinbaseWallet' | 'injected' | 'metaMask' | 'walletConnect') {
    const connector = getClient()?.connectors.find(item => item.id === id)
    if (!connector) throw new Error(`Missing ${id} connector`)

    return connector
  },

  async connectWalletConnect(onUri: (uri: string) => void, selectedChainId?: number) {
    const connector = this.getConnectorById('walletConnect')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)

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

  async connectCoinbaseMobile(onUri?: (uri: string) => void, selectedChainId?: number) {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)

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

  async connectCoinbaseExtension(selectedChainId?: number) {
    const connector = this.getConnectorById('coinbaseWallet')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  },

  async connectMetaMask(selectedChainId?: number) {
    const connector = this.getConnectorById('metaMask')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  },

  async connectInjected(selectedChainId?: number) {
    const connector = this.getConnectorById('injected')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  },

  async getActiveWalletConnectUri() {
    const connector = this.getConnectorById('walletConnect')
    const provider = await connector.getProvider()

    return provider.connector.uri
  },

  // -- accounts ----------------------------------------------------- //
  getAccount,

  watchAccount,

  disconnect,

  // -- network ------------------------------------------------------ //
  getNetwork,

  watchNetwork,

  switchNetwork,

  // -- block -------------------------------------------------------- //
  fetchBlockNumber,

  watchBlockNumber,

  // -- provider ----------------------------------------------------- //
  getProvider,

  watchProvider,

  getWebSocketProvider,

  watchWebSocketProvider,

  // -- balance ------------------------------------------------------ //
  fetchBalance,

  // -- signer ------------------------------------------------------- //
  fetchSigner,

  watchSigner,

  signMessage,

  signTypedData,

  // -- fees ---------------------------------------------------------- //
  fetchFeeData,

  // -- ens ----------------------------------------------------------- //
  fetchEnsAddress,

  fetchEnsAvatar,

  fetchEnsName,

  fetchEnsResolver,

  // -- token --------------------------------------------------------- //
  fetchToken,

  // -- transactions  ------------------------------------------------- //
  fetchTransaction,

  prepareSendTransaction,

  sendTransaction,

  waitForTransaction,

  // -- contracts  ---------------------------------------------------- //
  getContract,

  readContract,

  prepareWriteContract,

  writeContract,

  watchContractEvent,

  watchReadContract
}
