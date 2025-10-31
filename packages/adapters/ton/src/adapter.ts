import UniversalProvider from '@walletconnect/universal-provider'

import {
  type ChainNamespace,
  ConstantsUtil,
  NumberUtil,
  UserRejectedRequestError
} from '@reown/appkit-common'
import {
  AdapterBlueprint,
  BlockchainApiController,
  ChainController,
  ProviderController,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import type { TonConnector } from '@reown/appkit-utils/ton'

import { TonConnectConnector } from './connectors/TonConnectConnector.js'
import { TonWalletConnectConnector } from './connectors/TonWalletConnectConnector.js'
import { TonConnectUtil } from './utils/TonConnectUtil.js'

export class TonAdapter extends AdapterBlueprint<TonConnector> {
  private universalProvider: UniversalProvider | undefined = undefined

  constructor(params?: AdapterBlueprint.Params) {
    super({
      namespace: ConstantsUtil.CHAIN.TON,
      adapterType: ConstantsUtil.ADAPTER_TYPES.TON,
      ...params
    })
  }

  async syncConnectors() {
    const injectedNow = await TonConnectUtil.getInjectedWallets()

    const chains = ChainController.getCaipNetworks()
    injectedNow.forEach(wallet => this.addConnector(new TonConnectConnector({ wallet, chains })))
  }

  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)

    if (!connector) {
      throw new Error('Connector not found')
    }

    const chain = connector.chains.find(c => c.id === params.chainId) || connector.chains[0]

    if (!chain) {
      throw new Error('The connector does not support any of the requested chains')
    }

    const connection = this.getConnection({
      address: params.address,
      connectorId: connector.id,
      connections: this.connections,
      connectors: this.connectors
    })

    if (connection?.account) {
      this.emit('accountChanged', {
        address: connection.account.address,
        chainId: connection.caipNetwork?.id,
        connector
      })

      return {
        id: connector.id,
        type: connector.type,
        address: connection.account.address,
        chainId: chain.id,
        provider: connector
      }
    }

    const address = await connector.connect().catch(err => {
      throw new UserRejectedRequestError(err)
    })

    this.emit('accountChanged', {
      address,
      chainId: chain.id,
      connector
    })

    this.addConnection({
      connectorId: connector.id,
      accounts: [{ address, type: 'eoa' }],
      caipNetwork: chain
    })

    if (connector.id !== ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
      this.listenProviderEvents(connector.id, connector)
    }

    return {
      id: connector.id,
      type: connector.type,
      address,
      chainId: chain.id,
      provider: connector
    }
  }

  protected getActiveConnector(): TonConnector | undefined {
    return this.connector
  }

  override async getAccounts(): Promise<AdapterBlueprint.GetAccountsResult> {
    return Promise.resolve({
      accounts: []
    })
  }

  override async signMessage(): Promise<AdapterBlueprint.SignMessageResult> {
    // TON uses signData method instead of signMessage. This method exists only to satisfy the adapter interface
    return Promise.resolve({ signature: '' })
  }

  override async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    // TON uses sendMessage method instead of sendTransaction. This method exists only to satisfy the adapter interface
    return Promise.resolve({ hash: '' })
  }

  override async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    if (params?.id) {
      const connector = this.connectors.find(c => c.id === params.id)

      if (!connector) {
        throw new Error('TonAdapter:disconnect - connector not found')
      }

      const connection = this.getConnection({
        connectorId: connector.id,
        connections: this.connections,
        connectors: this.connectors
      })

      try {
        await connector.disconnect()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('TonAdapter:disconnect - error', error)
      }

      this.removeProviderListeners(connector.id)
      this.deleteConnection(connector.id)

      if (this.connections.length === 0) {
        this.emit('disconnect')
      } else {
        this.emitFirstAvailableConnection()
      }

      return { connections: connection ? [connection] : [] }
    }

    return this.disconnectAll()
  }

  private async disconnectAll() {
    const connections = await Promise.all(
      this.connections.map(async connection => {
        const connector = this.connectors.find(c =>
          HelpersUtil.isLowerCaseMatch(c.id, connection.connectorId)
        )

        if (!connector) {
          throw new Error('Connector not found')
        }

        await this.disconnect({
          id: connector.id
        })

        return connection
      })
    )

    return { connections }
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const providerType = ProviderController.getProviderId(params.caipNetwork.chainNamespace)
    const provider = ProviderController.getProvider<TonConnector>(params.caipNetwork.chainNamespace)

    if (providerType === 'WALLET_CONNECT' || providerType === 'AUTH') {
      return await super.switchNetwork(params)
    }

    if (!provider) {
      throw new Error('Provider not found')
    }

    return await provider.switchNetwork(params.caipNetwork.caipNetworkId)
  }

  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    const wcConnectorId = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: ConstantsUtil.CHAIN.TON,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => super.onAccountsChanged(accounts, wcConnectorId, false)
    })

    this.addConnector(
      new TonWalletConnectConnector({
        provider: universalProvider,
        chains: ChainController.getCaipNetworks()
      })
    )

    return Promise.resolve()
  }

  override async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const caipNetworkId = params.caipNetwork?.caipNetworkId
    const address = params.address

    if (!address || !caipNetworkId) {
      return { balance: '0', symbol: 'TON' }
    }

    const balance = await BlockchainApiController.getAddressBalance({
      caipNetworkId,
      address
    })

    const formattedBalance = NumberUtil.bigNumber(balance)
      .div(10 ** 9)
      .toString()

    return { balance: formattedBalance, symbol: 'TON' }
  }

  override parseUnits(): bigint {
    return BigInt(0)
  }

  override formatUnits(): string {
    return ''
  }

  public async syncConnections({
    connectToFirstConnector,
    caipNetwork
  }: AdapterBlueprint.SyncConnectionsParams) {
    await Promise.all(
      this.connectors
        .filter(c => {
          const { hasDisconnected, hasConnected } = HelpersUtil.getConnectorStorageInfo(
            c.id,
            this.namespace as ChainNamespace
          )

          return !hasDisconnected && hasConnected
        })
        .map(async connector => {
          if (connector.id === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
            const accounts = WcHelpersUtil.getWalletConnectAccounts(
              this.universalProvider as UniversalProvider,
              this.namespace as ChainNamespace
            )

            if (accounts.length > 0) {
              this.addConnection({
                connectorId: connector.id,
                accounts: accounts.map(account => ({ address: account.address })),
                caipNetwork
              })
            }
          } else {
            const address = await connector.connect({})

            if (address) {
              this.addConnection({
                connectorId: connector.id,
                accounts: [{ address }],
                caipNetwork
              })

              this.listenProviderEvents(connector.id, connector)
            }
          }
        })
    )

    if (connectToFirstConnector) {
      this.emitFirstAvailableConnection()
    }
  }

  override async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)

    if (!connector) {
      return { id: '', address: '', chainId: '', provider: undefined, type: 'EXTERNAL' }
    }

    return this.connect({
      id: connector.id,
      chainId: params.chainId,
      type: connector.type
    })
  }

  override async estimateGas(
    _params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    // Placeholder implementation
    return Promise.resolve({ gas: BigInt(0) })
  }

  override async writeContract(
    _params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    // Placeholder implementation
    return Promise.resolve({ hash: '' })
  }

  override async grantPermissions(
    _params: AdapterBlueprint.GrantPermissionsParams
  ): Promise<unknown> {
    // Placeholder implementation
    return Promise.resolve({})
  }

  override async getCapabilities(
    _params: AdapterBlueprint.GetCapabilitiesParams
  ): Promise<unknown> {
    // Placeholder implementation
    return Promise.resolve({})
  }

  override async revokePermissions(
    _params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    return Promise.resolve('0x0000000000000000000000000000000000000000')
  }

  override async walletGetAssets(
    _params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    // Placeholder implementation - cast to satisfy type
    return Promise.resolve({} as AdapterBlueprint.WalletGetAssetsResponse)
  }

  public getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    const walletConnectProvider = new TonWalletConnectConnector({
      provider: params.provider as UniversalProvider,
      chains: params.caipNetworks
    })

    return walletConnectProvider as unknown as UniversalProvider
  }
}
