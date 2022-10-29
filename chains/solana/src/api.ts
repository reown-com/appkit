import type { WalletConnectAppMetadata } from '@walletconnect/solib'
import {
  connect,
  watchAddress,
  disconnect,
  signMessage,
  switchNetwork,
  getTransaction,
  signTransaction,
  signAndSendTransaction,
  getConnectorIsAvailable,
  init,
  fetchName,
  getFeeForMessage,
  getNetwork,
  watchNetwork,
  getBalance,
  PhantomConnector,
  switchConnector,
  WalletConnectConnector,
  getAddress,
  watchTransaction,
  mainnetBetaProjectSerum,
  InjectedConnector
} from '@walletconnect/solib'

export interface ClientClientArgs {
  projectId: string
  metadata: WalletConnectAppMetadata
}

export const Web3ModalSolana = {
  disconnect,

  async connectInjected(name = 'window.solana'): Promise<string | null> {
    switchConnector(InjectedConnector.connectorName(name))

    return connect()
  },

  async connectPhantom(): Promise<string | null> {
    switchConnector(PhantomConnector.connectorName())

    return connect()
  },

  async connectWalletConnect(onUri: (uri: string) => void, onConnect: (address: string) => void) {
    switchConnector(WalletConnectConnector.connectorName)

    watchAddress(address => {
      onConnect(address ?? '')
    })

    const uri = await connect()

    if (uri) onUri(uri)
    else throw new Error('Could not connect with WalletConnect')
  },

  async connectLinking(onUri: (uri: string) => void, onConnect: (address: string) => void) {
    await this.connectWalletConnect(uri => {
      onUri(encodeURIComponent(uri))
    }, onConnect)
  },

  getAccount() {
    return {
      address: getAddress(),
      isConnected: Boolean(getAddress())
    }
  },

  // -- config ------------------------------------------------------- //
  createClient(args: ClientClientArgs) {
    init(
      () => ({
        chosenCluster: mainnetBetaProjectSerum,
        connectorName: WalletConnectConnector.connectorName,
        connectors: [
          new PhantomConnector(),
          new InjectedConnector('window.solflare'),
          new InjectedConnector('window.solana'),
          new WalletConnectConnector({
            relayerRegion: 'wss://relay.walletconnect.com',
            autoconnect: true,
            metadata: args.metadata
          })
        ]
      }),
      args.projectId
    )

    return this
  },

  watchAddress,

  switchConnector,

  switchNetwork,

  getNetwork,

  watchNetwork,

  getBalance,

  signMessage,

  signTransaction,

  signAndSendTransaction,

  getTransaction,

  fetchName,

  getFeeForMessage,

  getConnectorIsAvailable,

  getAvailableNetworks() {
    return [mainnetBetaProjectSerum]
  },

  async waitForTransaction(transactionSignature: string) {
    return new Promise(resolve => {
      watchTransaction(transactionSignature, () => {
        getTransaction(transactionSignature).then(resolve)
      })
    })
  }
}
