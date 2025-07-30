import { type SuiClient, getSuiProvider } from '@mysten/sui/client'
import type UniversalProvider from '@walletconnect/universal-provider'

// Add for balance/tx

import { type AppKit, type AppKitOptions } from '@reown/appkit'
import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import {
  AlertController,
  ChainController,
  type Provider as CoreProvider,
  StorageUtil
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import { AdapterBlueprint } from '@reown/appkit/adapters'

import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'
import { SuiConstantsUtil } from './utils/SuiConstantsUtil.js'
import { watchSuiStandard } from './utils/watchStandard.js'

export class SuiAdapter extends AdapterBlueprint<WalletStandardConnector> {
  constructor(params: AdapterBlueprint.Params = {}) {
    super({
      namespace: ConstantsUtil.CHAIN.SUI,
      adapterType: CommonConstantsUtil.ADAPTER_TYPES.SUI, // If exists, else define
      ...params
    })
  }

  override syncConnectors(_options?: AppKitOptions, appKit?: AppKit) {
    const getActiveChain = () => appKit?.getCaipNetwork(ConstantsUtil.CHAIN.SUI)

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
      namespace: SuiConstantsUtil.CHAIN,
      address: a.address,
      type: 'eoa',
      publicKey: a.publicKey
    }))

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

  override async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const client = getSuiProvider(params.caipNetwork.rpcUrls.default.http[0])
    const balance = await client.getBalance({ owner: params.address })
    return { balance: balance.totalBalance, symbol: 'SUI' }
  }

  override async syncConnections(params: AdapterBlueprint.SyncConnectionsParams) {
    await this.connectionManager?.syncConnections({
      connectors: this.connectors,
      caipNetwork: params.caipNetwork,
      caipNetworks: this.getCaipNetworks(),
      universalProvider: this.universalProvider as UniversalProvider,
      onConnection: this.addConnection.bind(this),
      onListenProvider: (id, provider) => this.listenProviderEvents(id, provider as CoreProvider),
      getConnectionStatusInfo: params.getConnectorStorageInfo
    })
    if (params.connectToFirstConnector) this.emitFirstAvailableConnection()
  }

  override async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({ id: params.id, chainId: params.chainId, type: '' })
  }

  // Implement other required methods (placeholders)
  override async estimateGas(
    _params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    return { gas: BigInt(0) }
  }

  override async sendTransaction(
    _params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    return { hash: '' }
  }

  override async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) throw new Error('Connector not found')
    const signature = await connector.signPersonalMessage(new TextEncoder().encode(params.message))
    return { signature }
  }

  // Add similarly for writeContract, parseUnits, formatUnits, grantPermissions, getCapabilities, revokePermissions, walletGetAssets

  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    // Implement WalletConnect for Sui if needed

    return Promise.resolve()
  }
}
