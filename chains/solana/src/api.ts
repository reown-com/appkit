import {
  connect,
  watchAddress,
  signMessage,
  switchNetwork,
  getTransaction,
  signTransaction,
  signAndSendTransaction,
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
  mainnetBetaProjectSerum
} from '@walletconnect/solib'

export interface ClientClientArgs {
  projectId: string
}

export const Web3ModalSolana = {
  async connectWalletConnect(onUri: (uri: string) => void, onConnect: (address: string) => void) {
    switchConnector(WalletConnectConnector.connectorName)

    watchAddress(address => {
      if (address) onConnect(address)
      else throw new Error('Could not connect with WalletConnect')
    })

    const uri = await connect()

    if (uri) onUri(uri)
    else throw new Error('Could not connect with WalletConnect')
  },

  async connectLinking(onUri: (uri: string) => void, onConnect: (address: string) => void) {
    await this.connectWalletConnect(uri => {
      onUri(uri)
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
          new WalletConnectConnector({
            relayerRegion: 'wss://relay.walletconnect.com',
            autoconnect: true,
            metadata: {
              description: 'Test solana desc',
              name: 'Solana example',
              icons: [],
              url: 'https://walletconnect.com'
            }
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
