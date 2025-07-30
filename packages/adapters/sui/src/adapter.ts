import type UniversalProvider from '@walletconnect/universal-provider'

// Add for balance/tx

import { type AppKit, type AppKitOptions, WcHelpersUtil } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { HelpersUtil } from '@reown/appkit-utils'
import { AdapterBlueprint } from '@reown/appkit/adapters'

import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'
import { watchSuiStandard } from './utils/watchStandard.js'

export class SuiAdapter extends AdapterBlueprint<WalletStandardConnector> {
  private universalProvider: UniversalProvider | undefined = undefined

  constructor(params: AdapterBlueprint.Params = {}) {
    super({
      namespace: ConstantsUtil.CHAIN.SUI,
      adapterType: ConstantsUtil.ADAPTER_TYPES.SUI, // If exists, else define
      ...params
    })
  }

  override syncConnectors(_options?: AppKitOptions, appKit?: AppKit) {
    const getActiveChain = () => appKit?.getCaipNetwork(ConstantsUtil.CHAIN.SUI)
    console.log('>>> getActiveChain', getActiveChain())

    // @ts-expect-error - TODO: Fix this
    watchSuiStandard(this.getCaipNetworks(), getActiveChain, this.addConnector.bind(this))
  }

  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      throw new Error('connectionControllerClient:connectExternal - connector is undefined')
    }

    const chain = connector.chains.find(c => c.id === params.chainId) || connector.chains[0]

    if (!chain) {
      throw new Error('The connector does not support any of the requested chains')
    }

    const connection = this.connectionManager?.getConnection({
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

    const address = await connector.connect()

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

    return {
      id: connector.id,
      type: connector.type,
      address,
      chainId: chain.id,
      provider: connector.provider
    }
  }

  override async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      return { accounts: [] }
    }

    const addresses = await connector.getAccountAddresses()

    const accounts = addresses.map(a => ({
      namespace: ConstantsUtil.CHAIN.SUI,
      address: a.address,
      type: 'eoa',
      publicKey: a.publicKey
    }))

    // @ts-expect-error - TODO: Fix this
    return { accounts }
  }

  override async disconnect(params: AdapterBlueprint.DisconnectParams) {
    if (params.id) {
      const connector = this.connectors.find(c => HelpersUtil.isLowerCaseMatch(c.id, params.id))
      if (!connector) throw new Error('Connector not found')
      await connector.disconnect()
      this.deleteConnection(connector.id)
      if (this.connections.length === 0) this.emit('disconnect')
      else this.emitFirstAvailableConnection()
      return { connections: [] }
    }
    // Disconnect all logic
    return { connections: [] }
  }

  override async getBalance(): Promise<AdapterBlueprint.GetBalanceResult> {
    return Promise.resolve({ balance: '0.00', symbol: 'SUI' })
  }

  public async syncConnections({
    connectToFirstConnector,
    caipNetwork,
    getConnectorStorageInfo
  }: AdapterBlueprint.SyncConnectionsParams) {
    await this.connectionManager?.syncConnections({
      connectors: this.connectors,
      caipNetwork,
      caipNetworks: this.getCaipNetworks(),
      universalProvider: this.universalProvider as UniversalProvider,
      onConnection: this.addConnection.bind(this),
      onListenProvider: this.listenProviderEvents.bind(this),
      getConnectionStatusInfo: getConnectorStorageInfo
    })

    if (connectToFirstConnector) {
      this.emitFirstAvailableConnection()
    }
  }

  override async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({ id: params.id, chainId: params.chainId, type: '' })
  }

  override async signMessage(): Promise<AdapterBlueprint.SignMessageResult> {
    return { signature: 'tbd' }
  }

  // Add similarly for writeContract, parseUnits, formatUnits, grantPermissions, getCapabilities, revokePermissions, walletGetAssets

  public override setAuthProvider() {
    return undefined
  }

  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    const wcConnectorId = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: ConstantsUtil.CHAIN.SUI,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => this.onAccountsChanged(accounts, wcConnectorId, false)
    })

    // TODO: Implement WalletConnect for Sui if needed

    return Promise.resolve()
  }

  public getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    return undefined
  }

  // -- Unused => Refactor ------------------------------------------- //
  override estimateGas(
    _params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    // Estimate gas
    return Promise.resolve({} as unknown as AdapterBlueprint.EstimateGasTransactionResult)
  }

  override sendTransaction(
    _params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    // Send transaction
    return Promise.resolve({} as unknown as AdapterBlueprint.SendTransactionResult)
  }

  override writeContract(
    _params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    // Write contract
    return Promise.resolve({} as unknown as AdapterBlueprint.WriteContractResult)
  }

  override parseUnits(_params: AdapterBlueprint.ParseUnitsParams): bigint {
    // Parse units
    return BigInt(0)
  }

  override formatUnits(_params: AdapterBlueprint.FormatUnitsParams): string {
    // Format units
    return ''
  }

  override grantPermissions(_params: AdapterBlueprint.GrantPermissionsParams): Promise<unknown> {
    // Grant permissions
    return Promise.resolve({})
  }

  override getCapabilities(_params: AdapterBlueprint.GetCapabilitiesParams): Promise<unknown> {
    // Revoke permissions
    return Promise.resolve({})
  }

  override revokePermissions(
    _params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    // Get capabilities
    return Promise.resolve('0x')
  }

  public override async walletGetAssets(
    _params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return Promise.resolve({})
  }
}
