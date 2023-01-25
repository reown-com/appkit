import type { Chain, Client, Connector } from '@wagmi/core'
import {
  connect,
  disconnect,
  fetchBalance,
  fetchEnsAvatar,
  fetchEnsName,
  getAccount,
  getNetwork,
  switchNetwork,
  watchAccount,
  watchNetwork
} from '@wagmi/core'
import type { ConnectorId } from './types'

export class EthereumClient {
  private readonly wagmi = {} as Client
  public walletConnectUri = ''
  public walletConnectVersion = 1
  public readonly chains = [] as Chain[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(wagmi: any, chains: Chain[]) {
    const walletConnect = wagmi.connectors.find((c: Connector) => c.id === 'walletConnect')
    if (!walletConnect) {
      throw new Error('WalletConnectConnector is required')
    }
    this.wagmi = wagmi
    this.chains = chains
    this.walletConnectVersion = Number(walletConnect.options.version ?? '1')
  }

  // -- private ------------------------------------------- //
  private getDefaultConnectorChainId(connector: Connector) {
    return connector.chains[0].id
  }

  private async connectWalletConnectV1(connector: Connector, onUri: (uri: string) => void) {
    return new Promise<void>((resolve, reject) => {
      connector.once('message', async ({ type }) => {
        if (type === 'connecting') {
          const providerConnector = (await connector.getProvider()).connector
          this.walletConnectUri = providerConnector.uri
          onUri(providerConnector.uri)
          providerConnector.on('disconnect', () => {
            reject(Error())
          })
          providerConnector.on('connect', () => {
            resolve()
          })
        }
      })
    })
  }

  private async connectWalletConnectV2(connector: Connector, onUri: (uri: string) => void) {
    const provider = await connector.getProvider()
    let activeWalletConnectUri = ''

    return new Promise<void>(resolve => {
      provider.once('display_uri', (uri: string) => {
        this.walletConnectUri = uri
        activeWalletConnectUri = uri
        onUri(uri)
      })
      provider.once('connect', () => {
        if (activeWalletConnectUri === this.walletConnectUri) {
          resolve()
        }
      })
    })
  }

  // -- public web3modal ---------------------------------- //
  public namespace = 'eip155'

  public getDefaultChain() {
    const mainnet = this.chains.find(chain => chain.id === 1)

    return mainnet ?? this.chains[0]
  }

  public getConnectorById(id: ConnectorId | string) {
    const connector = this.wagmi.connectors.find(item => item.id === id)
    if (!connector) {
      throw new Error(`Connector for id ${id} was not found`)
    }

    return connector
  }

  public getConnectors() {
    const connectors = this.wagmi.connectors.filter(connector => connector.id !== 'walletConnect')

    return connectors
  }

  public async connectWalletConnect(onUri: (uri: string) => void, selectedChainId?: number) {
    const connector = this.getConnectorById('walletConnect')
    const isV1 = this.walletConnectVersion === 1
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)
    const handleProviderEvents = isV1
      ? this.connectWalletConnectV1.bind(this)
      : this.connectWalletConnectV2.bind(this)
    const [data] = await Promise.all([
      connect({ connector, chainId }),
      handleProviderEvents(connector, onUri)
    ])

    return data
  }

  public async connectConnector(connectorId: ConnectorId | string, selectedChainId?: number) {
    const connector = this.getConnectorById(connectorId)
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)
    const data = await connect({ connector, chainId })

    return data
  }

  public disconnect = disconnect

  public getAccount = getAccount

  public watchAccount = watchAccount

  public fetchBalance = fetchBalance

  public getNetwork = getNetwork

  public watchNetwork = watchNetwork

  public switchNetwork = switchNetwork

  // -- public web3modal (optional) ----------------------- //
  public fetchEnsName = fetchEnsName

  public fetchEnsAvatar = fetchEnsAvatar
}
