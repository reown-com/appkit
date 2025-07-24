import type UniversalProvider from '@walletconnect/universal-provider'

import {
  type AppKit,
  type AppKitOptions,
  CoreHelperUtil,
  type Provider,
  WcHelpersUtil
} from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController, StorageUtil } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import { type BitcoinConnector, BitcoinConstantsUtil } from '@reown/appkit-utils/bitcoin'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { bitcoin } from '@reown/appkit/networks'

import { BitcoinWalletConnectConnector } from './connectors/BitcoinWalletConnectConnector.js'
import { LeatherConnector } from './connectors/LeatherConnector.js'
import { OKXConnector } from './connectors/OKXConnector.js'
import { SatsConnectConnector } from './connectors/SatsConnectConnector.js'
import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'
import { BitcoinApi } from './utils/BitcoinApi.js'
import { UnitsUtil } from './utils/UnitsUtil.js'

export class BitcoinAdapter extends AdapterBlueprint<BitcoinConnector> {
  private api: BitcoinApi.Interface
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}
  private universalProvider: UniversalProvider | undefined = undefined

  constructor({ api = {}, ...params }: BitcoinAdapter.ConstructorParams = {}) {
    super({
      namespace: ConstantsUtil.CHAIN.BITCOIN,
      adapterType: ConstantsUtil.ADAPTER_TYPES.BITCOIN,
      ...params
    })

    this.api = {
      ...BitcoinApi,
      ...api
    }
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
    const accounts = await this.getAccounts({ id: connector.id })

    this.emit('accountChanged', {
      address,
      chainId: chain.id,
      connector
    })

    this.addConnection({
      connectorId: connector.id,
      accounts: accounts.accounts.map(a => ({ address: a.address, type: a.type })),
      caipNetwork: chain
    })

    if (connector.id !== CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
      this.listenProviderEvents(connector.id, connector as Provider)
    }

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
    const addresses = await this.connectors
      .find(connector => connector.id === params.id)
      ?.getAccountAddresses()
      .catch(() => [])

    let accounts = addresses?.map(a =>
      CoreHelperUtil.createAccount(
        ConstantsUtil.CHAIN.BITCOIN,
        a.address,
        a.purpose || 'payment',
        a.publicKey,
        a.path
      )
    )

    if (accounts && accounts.length > 1) {
      accounts = [
        {
          namespace: ConstantsUtil.CHAIN.BITCOIN,
          publicKey: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.PAYMENT]?.publicKey ?? '',
          path: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.PAYMENT]?.path ?? '',
          address: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.PAYMENT]?.address ?? '',
          type: 'payment'
        },
        {
          namespace: ConstantsUtil.CHAIN.BITCOIN,
          publicKey: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.ORDINAL]?.publicKey ?? '',
          path: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.ORDINAL]?.path ?? '',
          address: accounts[BitcoinConstantsUtil.ACCOUNT_INDEXES.ORDINAL]?.address ?? '',
          type: 'ordinal'
        }
      ]
    }

    return {
      accounts: accounts || []
    }
  }

  override async syncConnectors(_options?: AppKitOptions, appKit?: AppKit) {
    function getActiveNetwork() {
      return appKit?.getCaipNetwork(ConstantsUtil.CHAIN.BITCOIN)
    }

    WalletStandardConnector.watchWallets({
      callback: this.addConnector.bind(this),
      requestedChains: this.networks
    })

    const satsConnectConnectors = await SatsConnectConnector.getWallets({
      requestedChains: this.networks,
      getActiveNetwork
    })

    this.addConnector(
      ...satsConnectConnectors.map(connector => {
        switch (connector.wallet.id) {
          case LeatherConnector.ProviderId:
            return new LeatherConnector({
              connector
            })

          default:
            return connector
        }
      })
    )

    const okxConnector = OKXConnector.getWallet({
      requestedChains: this.networks,
      getActiveNetwork,
      requestedCaipNetworkId: getActiveNetwork()?.caipNetworkId
    })

    if (okxConnector) {
      this.addConnector(okxConnector)
    }
  }

  override syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({
      id: params.id,
      chainId: params.chainId,
      type: ''
    })
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

  override async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = params.provider as BitcoinConnector

    if (!connector) {
      throw new Error('BitcoinAdapter:signMessage - connector is undefined')
    }

    const signature = await connector.signMessage({
      message: params.message,
      address: params.address
    })

    return { signature }
  }

  public getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    const walletConnectProvider = new BitcoinWalletConnectConnector({
      provider: params.provider as UniversalProvider,
      chains: params.caipNetworks,
      getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
    })

    return walletConnectProvider as unknown as Provider
  }

  override async disconnect(params: AdapterBlueprint.DisconnectParams) {
    if (params.id) {
      const connector = this.connectors.find(c => HelpersUtil.isLowerCaseMatch(c.id, params.id))

      if (!connector?.provider) {
        throw new Error('BitcoinAdapter:disconnect - connector.provider is undefined')
      }

      const connection = this.connectionManager?.getConnection({
        connectorId: params.id,
        connections: this.connections,
        connectors: this.connectors
      })

      await connector.provider.disconnect()

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

  override async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const caipNetwork = params.caipNetwork
    const address = params.address

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'BTC' })
    }

    if (caipNetwork && caipNetwork.chainNamespace === this.namespace) {
      const caipAddress = `${caipNetwork?.caipNetworkId}:${address}`

      const cachedPromise = this.balancePromises[caipAddress]
      if (cachedPromise) {
        return cachedPromise
      }

      const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
      if (cachedBalance) {
        return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
      }
      this.balancePromises[caipAddress] = new Promise<AdapterBlueprint.GetBalanceResult>(
        async resolve => {
          const utxos = await this.api.getUTXOs({
            network: caipNetwork,
            address
          })

          const balance = utxos.reduce((acc, utxo) => acc + utxo.value, 0)
          const formattedBalance = UnitsUtil.parseSatoshis(balance.toString(), caipNetwork)

          StorageUtil.updateNativeBalanceCache({
            caipAddress,
            balance: formattedBalance,
            symbol: caipNetwork.nativeCurrency.symbol,
            timestamp: Date.now()
          })

          resolve({
            balance: formattedBalance,
            symbol: caipNetwork.nativeCurrency.symbol
          })
        }
      ).finally(() => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.balancePromises[caipAddress]
      })

      return (
        this.balancePromises[caipAddress] || Promise.resolve({ balance: '0.00', symbol: 'BTC' })
      )
    }

    // Get balance
    return Promise.resolve({
      balance: '0',
      symbol: bitcoin.nativeCurrency.symbol
    })
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    if (params.providerType === 'WALLET_CONNECT' || params.providerType === 'AUTH') {
      return await super.switchNetwork(params)
    }

    const connector = params.provider as BitcoinConnector

    if (!connector) {
      throw new Error('BitcoinAdapter:switchNetwork - provider is undefined')
    }

    return await connector.switchNetwork(params.caipNetwork.caipNetworkId)
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

  // -- Protected ------------------------------------------ //
  protected override async onChainChanged(chainId: string, connectorId: string) {
    const connector = this.connectors.find(c => c.id === connectorId)

    if (!connector) {
      throw new Error('BitcoinAdapter:onChainChanged - connector is undefined')
    }

    const { address } = await this.connect({
      id: connector.id,
      chainId,
      type: ''
    })

    const accounts = await this.getAccounts({ id: connector.id })
    const chain = connector.chains.find(c => c.id === chainId) || connector.chains[0]

    if (
      HelpersUtil.isLowerCaseMatch(
        this.getConnectorId(CommonConstantsUtil.CHAIN.BITCOIN),
        connector.id
      )
    ) {
      this.emit('switchNetwork', { chainId, address })
    }

    this.addConnection({
      connectorId: connector.id,
      accounts: accounts.accounts.map(a => ({ address: a.address, type: a.type })),
      caipNetwork: chain
    })
  }

  // -- Private ------------------------------------------ //
  public override setAuthProvider() {
    return undefined
  }

  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    const wcConnectorId = CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: CommonConstantsUtil.CHAIN.BITCOIN,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => this.onAccountsChanged(accounts, wcConnectorId, false)
    })

    this.addConnector(
      new BitcoinWalletConnectConnector({
        provider: universalProvider,
        chains: this.getCaipNetworks(),
        getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
      })
    )

    return Promise.resolve()
  }
}

export namespace BitcoinAdapter {
  export type ConstructorParams = Omit<AdapterBlueprint.Params, 'namespace'> & {
    api?: Partial<BitcoinApi.Interface>
  }
}
