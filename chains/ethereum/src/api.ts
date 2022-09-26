import type { Connector } from '@wagmi/core'
import * as WagmiCore from '@wagmi/core'
import { CoreHelpers } from '@web3modal/core'
import type { EthereumOptions } from '../types/apiTypes'
import { getClient, initializeClient } from './utils/wagmiHelpers'

export const Web3ModalEthereum = {
  // -- config ------------------------------------------------------- //
  createClient(options: EthereumOptions) {
    initializeClient(options)

    return this
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

  // -- accounts ----------------------------------------------------- //
  getAccount: WagmiCore.getAccount,

  watchAccount: WagmiCore.watchAccount,

  // -- network ------------------------------------------------------ //
  getNetwork: WagmiCore.getNetwork,

  watchNetwork: WagmiCore.watchNetwork,

  switchNetwork: WagmiCore.switchNetwork,

  /**
   * Old stuff
   */

  // -- actions ------------------------------------------------------ //

  signTypedData: WagmiCore.signTypedData,

  signMessage: WagmiCore.signMessage,

  // -- fetch -------------------------------------------------------- //
  fetchBalance: WagmiCore.fetchBalance,

  fetchSigner: WagmiCore.fetchSigner,

  // -- contract ----------------------------------------------------- //
  getContract: WagmiCore.getContract,

  fetchToken: WagmiCore.fetchToken,

  readContract: WagmiCore.readContract,

  writeContract: WagmiCore.writeContract,

  prepareWriteContract: WagmiCore.prepareWriteContract,

  watchReadContract: WagmiCore.watchReadContract,

  // -- ens ---------------------------------------------------------- //
  fetchEnsAddress: WagmiCore.fetchEnsAddress,

  fetchEnsAvatar: WagmiCore.fetchEnsAvatar,

  fetchEnsName: WagmiCore.fetchEnsName,

  fetchEnsResolver: WagmiCore.fetchEnsResolver,

  // -- transaction -------------------------------------------------- //
  fetchTransaction: WagmiCore.fetchTransaction,

  prepareSendTransaction: WagmiCore.prepareSendTransaction,

  sendTransaction: WagmiCore.sendTransaction,

  waitForTransaction: WagmiCore.waitForTransaction,

  // -- provider -------------------------------------------------- //
  getProvider: WagmiCore.getProvider,

  // -- network --------------------------------------------------- //
  fetchBlockNumber: WagmiCore.fetchBlockNumber,

  watchBlockNumber: WagmiCore.watchBlockNumber
}
