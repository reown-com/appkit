import UniversalProvider from '@walletconnect/universal-provider'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { AdapterBlueprint, ChainController, WcHelpersUtil } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import type { StellarConnector } from '@reown/appkit-utils/stellar'

import { StellarWalletConnectConnector } from './connectors/StellarWalletConnectConnector.js'

// -- Constants ------------------------------------------------------------------ //
const NATIVE_SYMBOL = 'XLM'

// -- Types ---------------------------------------------------------------------- //
export type StellarAdapterParams = AdapterBlueprint.Params

type HorizonAccountResponse = {
  balances?: { asset_type?: string; balance?: string }[]
}

/**
 * Stellar adapter.
 *
 * Stellar wallets are reached over WalletConnect only -- there is no extension
 * or injected-wallet support. The extension-shaped parts of the blueprint are
 * implemented as no-ops that satisfy the interface rather than being left
 * unimplemented, so the rest of AppKit can treat Stellar like any other
 * namespace.
 */
export class StellarAdapter extends AdapterBlueprint<StellarConnector> {
  private universalProvider: UniversalProvider | undefined = undefined

  constructor(params?: StellarAdapterParams) {
    super({
      namespace: ConstantsUtil.CHAIN.STELLAR,
      adapterType: ConstantsUtil.ADAPTER_TYPES.STELLAR,
      ...params
    })
  }

  /**
   * No-op: Stellar support is WalletConnect-only, so there are no injected
   * wallets to discover. The WalletConnect connector is registered in
   * `setUniversalProvider` instead.
   */
  syncConnectors() {
    // Intentionally empty -- see the note above.
  }

  public override async setUniversalProvider(universalProvider: UniversalProvider) {
    this.universalProvider = universalProvider

    const wcConnectorId = ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: ConstantsUtil.CHAIN.STELLAR,
      onConnect: accounts => this.onConnect(accounts, wcConnectorId),
      onDisconnect: () => this.onDisconnect(wcConnectorId),
      onAccountsChanged: accounts => super.onAccountsChanged(accounts, wcConnectorId, false)
    })

    this.addConnector(
      new StellarWalletConnectConnector({
        provider: universalProvider,
        chains: ChainController.getCaipNetworks()
      })
    )

    return Promise.resolve()
  }

  protected getActiveConnector(): StellarConnector | undefined {
    return this.connector
  }

  /*
   * Nothing to await: the WalletConnect handshake is driven by the universal
   * adapter, so by this point the account is already on the session. Kept
   * `async` regardless, so the throws below surface as rejections rather than
   * synchronous exceptions.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)

    if (!connector) {
      throw new Error('StellarAdapter:connect - connector not found')
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

    /*
     * The WalletConnect handshake itself is driven by the universal adapter, so
     * by the time we get here the address comes from either a tracked
     * connection or the live session.
     */
    const address =
      connection?.account?.address ??
      WcHelpersUtil.getWalletConnectAccounts(
        this.universalProvider as UniversalProvider,
        this.namespace as ChainNamespace
      )[0]?.address

    if (!address) {
      throw new Error('StellarAdapter:connect - no Stellar account found in the session')
    }

    this.emit('accountChanged', { address, chainId: chain.id, connector })

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
      provider: connector
    }
  }

  override async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    if (params?.id) {
      const connector = this.connectors.find(c => c.id === params.id)

      if (!connector) {
        throw new Error('StellarAdapter:disconnect - connector not found')
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
        console.error('[StellarAdapter] disconnect error:', error)
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

        await this.disconnect({ id: connector.id })

        return connection
      })
    )

    return { connections }
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

          return Promise.resolve()
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

  override async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = params.provider as StellarConnector

    if (!connector) {
      throw new Error('StellarAdapter:signMessage - connector is undefined')
    }

    const { signature } = await connector.signMessage({
      message: params.message,
      address: params.address
    })

    return { signature }
  }

  /**
   * Reads the account's native XLM balance straight from Horizon -- the
   * Blockchain API has no Stellar support today.
   */
  override async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const address = params.address
    const horizonUrl =
      params.caipNetwork?.rpcUrls?.['chainDefault']?.http?.[0] ||
      params.caipNetwork?.rpcUrls?.default?.http?.[0]

    if (!address || !horizonUrl) {
      return { balance: '0', symbol: NATIVE_SYMBOL }
    }

    try {
      const response = await fetch(`${horizonUrl.replace(/\/$/u, '')}/accounts/${address}`)

      /*
       * Horizon answers 404 for accounts that exist as a keypair but have never
       * been funded. That is a zero balance, not an error.
       */
      if (!response.ok) {
        if (response.status === 404) {
          return { balance: '0', symbol: NATIVE_SYMBOL }
        }

        throw new Error(`Horizon responded with ${response.status}`)
      }

      const data = (await response.json()) as HorizonAccountResponse
      const native = data?.balances?.find(balance => balance.asset_type === 'native')

      return { balance: native?.balance ?? '0', symbol: NATIVE_SYMBOL }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[StellarAdapter] getBalance error:', error)

      return { balance: '0', symbol: NATIVE_SYMBOL }
    }
  }

  public getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    const walletConnectProvider = new StellarWalletConnectConnector({
      provider: params.provider as UniversalProvider,
      chains: params.caipNetworks
    })

    return walletConnectProvider as unknown as UniversalProvider
  }

  /*
   * -- Not applicable to Stellar ------------------------------------------------
   * These satisfy AdapterBlueprint without pretending to do anything. Stellar
   * transactions are XDR envelopes built by the dapp, so they are signed through
   * the connector (`signXDR` / `signAndSubmitXDR`) rather than through the
   * generic EVM-shaped blueprint methods below.
   */
  override async getAccounts(): Promise<AdapterBlueprint.GetAccountsResult> {
    return Promise.resolve({ accounts: [] })
  }

  override async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    return Promise.resolve({ hash: '' })
  }

  override async writeContract(
    _params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    return Promise.resolve({ hash: '' })
  }

  override async writeSolanaTransaction(): Promise<AdapterBlueprint.WriteSolanaTransactionResult> {
    return Promise.resolve({ hash: '' })
  }

  override async estimateGas(
    _params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    return Promise.resolve({ gas: BigInt(0) })
  }

  override parseUnits(): bigint {
    return BigInt(0)
  }

  override formatUnits(): string {
    return ''
  }

  override async grantPermissions(
    _params: AdapterBlueprint.GrantPermissionsParams
  ): Promise<unknown> {
    return Promise.resolve({})
  }

  override async getCapabilities(
    _params: AdapterBlueprint.GetCapabilitiesParams
  ): Promise<unknown> {
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
    return Promise.resolve({} as AdapterBlueprint.WalletGetAssetsResponse)
  }
}
