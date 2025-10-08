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
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { HelpersUtil, type Provider } from '@reown/appkit-utils'
import type { TonConnector } from '@reown/appkit-utils/ton'

import { TonConnectConnector } from './connectors/TonConnectConnector.js'
import { TonWalletConnectConnector } from './connectors/TonWalletConnectConnector.js'
import { getWallets as getInjectedWallets } from './utils/TonConnectUtil.js'

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
    const injectedNow = await getInjectedWallets({ cacheTTLMs: 60_000 })

    const chains = this.getCaipNetworks()
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
        provider: connector.provider
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
      accounts: [],
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
      provider: connector.provider
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
    return Promise.resolve({ signature: '' })
  }

  override async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    const connector = this.getActiveConnector()
    if (!connector) {
      throw new Error('No active connector')
    }

    // @ts-expect-error - Placeholder implementation, needs proper params
    return connector.sendMessage({ message: {} })
  }

  override async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    if (params?.id) {
      const connector = this.connectors.find(c => c.id === params.id)
      if (!connector) {
        return { connections: [] }
      }

      const connection = this.getConnection({
        connectorId: connector.id,
        connections: this.connections,
        connectors: this.connectors
      })

      try {
        await connector.disconnect()
      } catch {
        // Ignore disconnect errors
      }

      // Update AppKit state and emit events
      this.onDisconnect(connector.id)

      return { connections: connection ? [connection] : [] }
    }

    // No id: disconnect all
    const removed = await Promise.all(
      this.connections.map(async c => {
        const conn = this.connectors.find(cc => cc.id === c.connectorId)
        try {
          await conn?.disconnect()
        } catch {
          // Ignore disconnect errors
        }

        return c
      })
    )
    this.clearConnections(true)
    this.emit('disconnect')

    return { connections: removed }
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const connector = this.getActiveConnector()

    if (connector) {
      await connector.switchNetwork(params.caipNetwork.caipNetworkId)
    }
  }

  // @ts-expect-error will fix up issues
  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    const wcConnectorId = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      // @ts-expect-error will fix up issues
      universalProvider,
      namespace: ConstantsUtil.CHAIN.TON,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => super.onAccountsChanged(accounts, wcConnectorId, false)
    })

    this.addConnector(
      new TonWalletConnectConnector({
        // @ts-expect-error will fix up issues
        provider: universalProvider,
        chains: this.getCaipNetworks(),
        getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
      })
    )

    return Promise.resolve()
  }

  override async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const chain = params.chainId
    const address = params.address

    if (!address || !chain) {
      return { balance: '0', symbol: 'TON' }
    }

    const chainToCaipNetworkIdMap = {
      '-239': 'ton:mainnet',
      '-3': 'ton:testnet'
    }

    const balance = await BlockchainApiController.fetchTonBalance({
      caipNetworkId:
        chainToCaipNetworkIdMap[params.chainId as keyof typeof chainToCaipNetworkIdMap],
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
              // @ts-expect-error will fix up issues
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

              this.listenProviderEvents(connector.id, connector.provider as TonConnector)
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
      // @ts-expect-error will fix up issues
      provider: params.provider,
      chains: params.caipNetworks,
      getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
    })

    // @ts-expect-error will fix up issues
    return walletConnectProvider as unknown as Provider
  }
}
