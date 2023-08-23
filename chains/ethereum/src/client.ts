import type { Chain, Config, ConnectArgs, Connector } from '@wagmi/core'
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

// -- helpers ------------------------------------------- //
const ADD_ETH_CHAIN_METHOD = 'wallet_addEthereumChain'

export class EthereumClient {
  private readonly wagmi = {} as Config

  public readonly chains = [] as Chain[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(wagmi: any, chains: Chain[]) {
    this.wagmi = wagmi
    this.chains = chains
  }

  // -- private ------------------------------------------- //
  private getWalletConnectConnector() {
    const connector = this.wagmi.connectors.find((c: Connector) => c.id === 'walletConnect')

    if (!connector) {
      throw new Error('WalletConnectConnector is required')
    }

    return connector
  }

  private async connectWalletConnectProvider(connector: Connector, onUri: (uri: string) => void) {
    await connector.getProvider()

    return new Promise<void>(resolve => {
      connector.once('message', event => {
        if (event.type === 'display_uri') {
          onUri(event.data as string)
          resolve()
        }
      })
    })
  }

  // -- public web3modal ---------------------------------- //
  public namespace = 'eip155'

  public getConnectorById(id: ConnectorId | string) {
    const connector = this.wagmi.connectors.find(item => item.id === id)
    if (!connector) {
      throw new Error(`Connector for id ${id} was not found`)
    }

    return connector
  }

  public getConnectors() {
    const connectors = this.wagmi.connectors.filter(
      connector => !connector.id.includes('walletConnect')
    )

    return connectors
  }

  public async connectWalletConnect(onUri: (uri: string) => void, chainId?: number) {
    const connector = this.getWalletConnectConnector()
    const options: ConnectArgs = { connector }
    if (chainId) {
      options.chainId = chainId
    }

    return Promise.all([connect(options), this.connectWalletConnectProvider(connector, onUri)])
  }

  public async connectConnector(connectorId: ConnectorId | string, chainId?: number) {
    const connector = this.getConnectorById(connectorId)
    const options: ConnectArgs = { connector }
    if (chainId) {
      options.chainId = chainId
    }
    const data = await connect(options)

    return data
  }

  public isInjectedProviderInstalled() {
    // @ts-expect-error - ethereum can exist
    return typeof window.ethereum !== 'undefined'
  }

  public safeCheckInjectedProvider(providerId: string) {
    try {
      const stringId = String(providerId)

      // @ts-expect-error - Structure is correct
      return Boolean(window.ethereum?.[stringId])
    } catch (err) {
      console.error(err)

      return false
    }
  }

  public async getConnectedChainIds() {
    const connector = this.getWalletConnectConnector()
    const provider = await connector.getProvider()
    const sessionNamespaces = provider.signer?.session?.namespaces
    const sessionMethods = sessionNamespaces?.[this.namespace]?.methods

    if (sessionMethods?.includes(ADD_ETH_CHAIN_METHOD)) {
      return 'ALL'
    }

    if (sessionNamespaces) {
      const sessionAccounts: string[] = []
      Object.keys(sessionNamespaces).forEach(namespaceKey => {
        if (namespaceKey.includes(this.namespace)) {
          sessionAccounts.push(...sessionNamespaces[namespaceKey].accounts)
        }
      })
      const sessionChains = sessionAccounts?.map((a: string) => a.split(':')[1])

      return sessionChains
    }

    return 'ALL'
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
