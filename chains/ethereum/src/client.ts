import type { Chain, Client, Connector } from '@wagmi/core'
import {
  connect,
  disconnect,
  fetchBalance,
  getAccount,
  getNetwork,
  switchNetwork,
  watchAccount,
  watchNetwork
} from '@wagmi/core'
import { chainIconPreset, getInjectedId, getInjectedName, injectedPreset } from './presets'
import type { ConnectorId } from './types'

export class EthereumClient {
  private readonly wagmi = {} as Client
  public readonly chains = [] as Chain[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(wagmi: any, chains: Chain[]) {
    const walletConnect = wagmi.connectors.find((c: Connector) => c.id === 'walletConnect')
    if (!walletConnect) {
      throw new Error('WalletConnectConnector is required')
    }
    this.wagmi = wagmi
    this.chains = chains
  }

  // -- private ------------------------------------------- //
  private getDefaultConnectorChainId(connector: Connector) {
    return connector.chains[0].id
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

  public async getActiveWalletConnectUri() {
    const connector = this.getConnectorById('walletConnect')
    const provider = await connector.getProvider()

    return provider.connector.uri
  }

  public getConnectorWallets() {
    const connectors = this.wagmi.connectors.filter(connector => connector.id !== 'walletConnect')

    return connectors
  }

  public async connectWalletConnect(onUri: (uri: string) => void, selectedChainId?: number) {
    const connector = this.getConnectorById('walletConnect')
    const chainId = selectedChainId ?? this.getDefaultConnectorChainId(connector)

    async function getProviderUri() {
      return new Promise<void>((resolve, reject) => {
        connector.once('message', async ({ type }) => {
          if (type === 'connecting') {
            const providerConnector = (await connector.getProvider()).connector
            onUri(providerConnector.uri)
            providerConnector.on('disconnect', () => {
              reject(Error('Connection request declined'))
            })
            providerConnector.on('connect', () => {
              resolve()
            })
          }
        })
      })
    }

    const [data] = await Promise.all([connect({ connector, chainId }), getProviderUri()])

    return data
  }

  public async connectCoinbaseMobile(onUri?: (uri: string) => void, selectedChainId?: number) {
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

  // -- public presets ----------------------------------- //
  public injectedPreset = injectedPreset

  public chainIconPreset = chainIconPreset

  public getInjectedId = getInjectedId

  public getInjectedName = getInjectedName
}
