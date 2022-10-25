import {
  connect,
  watchAddress,
  signMessage,
  signTransaction,
  signAndSendTransaction,
  init,
  getBalance,
  mainnetBetaProjectSerum,
  PhantomConnector,
  switchConnector,
  WalletConnectConnector,
  getAddress
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
        connectorName: PhantomConnector.connectorName(),
        connectors: [
          new PhantomConnector(),
          new WalletConnectConnector({
            relayerRegion: 'wss://relay.walletconnect.com',
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

  getBalance,

  signMessage,

  signTransaction,

  signAndSendTransaction
}
