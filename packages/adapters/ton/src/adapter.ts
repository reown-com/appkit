import { WcHelpersUtil } from '@reown/appkit'
import { ConstantsUtil, NumberUtil } from '@reown/appkit-common'
import { BlockchainApiController, ChainController } from '@reown/appkit-controllers'
import type { TonConnector } from '@reown/appkit-utils/ton'
import { getWallets as getInjectedWallets } from '@reown/appkit-utils/ton'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { ton } from '@reown/appkit/networks'

import { TonConnectConnector } from './connectors/TonConnectConnector.js'
import { TonWalletConnectConnector } from './connectors/TonWalletConnectConnector.js'

export class TonAdapter extends AdapterBlueprint<TonConnector> {
  constructor(params?: AdapterBlueprint.Params) {
    super({
      namespace: ConstantsUtil.CHAIN.TON,
      adapterType: ConstantsUtil.ADAPTER_TYPES.TON,
      ...params
    })
  }

  override async syncConnectors() {
    try {
      console.log('[TonAdapter] syncConnectors: start')
      // Use simplified utils.getWallets(): returns injected wallets with name resolved via remote list
      const injectedNow = await getInjectedWallets({ cacheTTLMs: 60_000 })
      console.log('[TonAdapter] syncConnectors: injected (final)', injectedNow)

      const chains = this.getCaipNetworks()
      injectedNow.forEach(wallet =>
        this.addConnector(new TonConnectConnector({ wallet: wallet as any, chains }))
      )
      console.log('[TonAdapter] syncConnectors: completed', injectedNow.length)
    } catch (err) {
      console.error('[TonAdapter] syncConnectors error', err)
    }
  }

  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    console.log('[TonAdapter] connect: start', params)

    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      throw new Error('Connector not found')
    }
    try {
      const address = await connector.connect({ chainId: params.chainId as string })
      console.log('[TonAdapter] connect: address2', address, params)
      /*
       * Set connection, emit events, etc.
       * Mirror logic from BitcoinAdapter
       */
      const chainId = params.chainId || ton.caipNetworkId

      this.emit('accountChanged', { address, chainId, connector })
      this.connector = connector // Set active connector

      const caipNetwork =
        this.getCaipNetworks()?.find(n => n.id === chainId) || this.getCaipNetworks()[0]
      if (caipNetwork) {
        this.addConnection({
          connectorId: connector.id,
          accounts: [{ address }],
          caipNetwork
        })
      }

      return {
        id: connector.id,
        address,
        chainId,
        // @ts-expect-error
        provider: connector,
        type: connector.type
      }
    } catch (error) {
      console.error('[TonAdapter] connect: error', error)

      return {
        id: connector.id,
        address: '',
        chainId: '',
        provider: undefined,
        type: connector.type
      }
    }
  }

  protected getActiveConnector(): TonConnector | undefined {
    return this.connector
  }

  override async getAccounts(): Promise<AdapterBlueprint.GetAccountsResult> {
    const address = await this.connector?.getAccount().catch(() => undefined)

    return {
      accounts: address
        ? [{ namespace: this.namespace as any, address, type: 'payment' as any }]
        : []
    }
  }

  override async signMessage(): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = this.getActiveConnector()
    if (!connector) {
      throw new Error('No active connector')
    }

    // @ts-expect-error
    return connector.signMessage({} as any)
  }

  override async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    const connector = this.getActiveConnector()
    if (!connector) {
      throw new Error('No active connector')
    }

    // @ts-expect-error
    return connector.sendTransaction({ transaction: {} as any })
  }

  override async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    if (params?.id) {
      const connector = this.connectors.find(c => c.id === params.id)
      if (!connector) {
        return { connections: [] }
      }

      const connection = this.connectionManager?.getConnection({
        connectorId: connector.id,
        connections: this.connections,
        connectors: this.connectors
      })

      try {
        await connector.disconnect()
      } catch {}

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
        } catch {}

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

  public override async setUniversalProvider(universalProvider: any) {
    const wcConnectorId = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: ConstantsUtil.CHAIN.TON,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => super.onAccountsChanged(accounts, wcConnectorId, false)
    })

    const tonConnector = new TonWalletConnectConnector({
      provider: universalProvider as unknown as any,
      chains: this.getCaipNetworks(),
      getActiveChain: () => this.getCaipNetworks()?.find(n => n.chainNamespace === this.namespace)
    })

    this.addConnector(tonConnector)

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
      .div(10 ** 8)
      .toString()

    return { balance: formattedBalance, symbol: 'TON' }
  }

  // Other methods as empty or throw 'Not supported for TON'
  override parseUnits(): bigint {
    // Implement if needed
    return BigInt(0)
  }

  override formatUnits(): string {
    return ''
  }

  override async syncConnections(_params: AdapterBlueprint.SyncConnectionsParams): Promise<void> {
    return Promise.resolve()
  }

  override async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    try {
      const connector = this.connectors.find(c => c.id === params.id) || this.connectors[0]
      if (!connector) {
        throw new Error('Connector not found')
      }

      const address = await (connector as any).restoreConnection?.()
      const chainId = params.chainId || ton.caipNetworkId

      if (address) {
        this.emit('accountChanged', { address, chainId, connector })
        this.connector = connector
        const caipNetwork = this.getCaipNetworks()[0]
        if (caipNetwork) {
          this.addConnection({ connectorId: connector.id, accounts: [{ address }], caipNetwork })
        }

        return {
          id: connector.id,
          address,
          chainId,
          // @ts-expect-error
          provider: connector,
          type: connector.type
        }
      }
    } catch {}

    return { id: '', address: '', chainId: '', provider: undefined, type: 'EXTERNAL' }
  }

  override async estimateGas(
    _params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    return { gas: BigInt(0) } // Placeholder
  }

  override async writeContract(
    _params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    return { hash: '' } // Placeholder
  }

  override async grantPermissions(
    _params: AdapterBlueprint.GrantPermissionsParams
  ): Promise<unknown> {
    return {} // Placeholder
  }

  override async getCapabilities(
    _params: AdapterBlueprint.GetCapabilitiesParams
  ): Promise<unknown> {
    return {} // Placeholder
  }

  override async revokePermissions(
    _params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    return Promise.resolve('0x0000000000000000000000000000000000000000')
  }

  override async walletGetAssets(
    _params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return {} as AdapterBlueprint.WalletGetAssetsResponse // Cast to satisfy type
  }

  override getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    const walletConnectProvider = new TonWalletConnectConnector({
      provider: params.provider as unknown as any,
      chains: params.caipNetworks,
      getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
    })

    return walletConnectProvider as unknown as AdapterBlueprint.GetWalletConnectProviderResult
  }

  // For QR and universal link handling, TBD
}
