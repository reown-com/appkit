import {
  CoreHelperUtil,
  WcHelpersUtil,
  type AppKit,
  type AppKitOptions,
  type Provider
} from '@reown/appkit'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import type { BitcoinConnector } from './utils/BitcoinConnector.js'
import type UniversalProvider from '@walletconnect/universal-provider'
import { SatsConnectConnector } from './connectors/SatsConnectConnector.js'
import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'
import { WalletConnectProvider } from './utils/WalletConnectProvider.js'
import { LeatherConnector } from './connectors/LeatherConnector.js'

export class BitcoinAdapter extends AdapterBlueprint<BitcoinConnector> {
  private eventsToUnbind: (() => void)[] = []

  constructor(params: BitcoinAdapter.ConstructorParams) {
    super({
      namespace: 'bip122',
      ...params
    })
  }

  public async connectWalletConnect(onUri: (uri: string) => void): Promise<void> {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
    const provider = connector?.provider as UniversalProvider
    if (!this.caipNetworks || !provider) {
      throw new Error(
        'UniversalAdapter:connectWalletConnect - caipNetworks or provider is undefined'
      )
    }

    provider.on('display_uri', (uri: string) => {
      onUri(uri)
    })

    const namespaces = WcHelpersUtil.createNamespaces(this.caipNetworks)
    await provider.connect({ optionalNamespaces: namespaces })
  }

  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      throw new Error('connectionControllerClient:connectExternal - connector is undefined')
    }

    const address = await connector.connect()

    this.connector = connector
    this.bindEvents(this.connector)

    return {
      id: connector.id,
      type: connector.type,
      address,
      chainId: this.networks[0]?.id || '',
      provider: connector.provider
    }
  }
  override async getAccounts(
    _params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const addresses = await this.connector?.getAccountAddresses()
    const accounts = addresses?.map(a =>
      CoreHelperUtil.createAccount(
        'bip122',
        a.address,
        (a.purpose || 'payment') as BitcoinConnector.AccountAddress['purpose']
      )
    )

    return {
      accounts: accounts || []
    }
  }
  override syncConnectors(_options?: AppKitOptions, appKit?: AppKit): void {
    WalletStandardConnector.watchWallets({
      callback: this.addConnector.bind(this),
      requestedChains: this.networks
    })

    this.addConnector(
      ...SatsConnectConnector.getWallets({
        requestedChains: this.networks,
        getActiveNetwork: () => appKit?.getCaipNetwork()
      }).map(connector => {
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
  }

  override syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({
      id: params.id,
      chainId: params.chainId || this.networks[0]?.id || '',
      type: ''
    })
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
    const walletConnectProvider = new WalletConnectProvider({
      provider: params.provider as UniversalProvider,
      chains: params.caipNetworks,
      getActiveChain: () => params.activeCaipNetwork
    })

    return walletConnectProvider as unknown as Provider
  }

  override switchNetwork(_params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    // Switch network
    return Promise.resolve()
  }

  override async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    if (params?.provider) {
      await params.provider.disconnect()
    } else if (this.connector) {
      await this.connector.disconnect()
    }
    this.unbindEvents()
  }

  // -- Unused => Refactor ------------------------------------------- //

  override getBalance(
    _params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    // Get balance
    return Promise.resolve({} as unknown as AdapterBlueprint.GetBalanceResult)
  }

  override getProfile(
    _params: AdapterBlueprint.GetProfileParams
  ): Promise<AdapterBlueprint.GetProfileResult> {
    // Get profile
    return Promise.resolve({} as unknown as AdapterBlueprint.GetProfileResult)
  }

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

  override getEnsAddress(
    _params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult> {
    // Get ENS address
    return Promise.resolve({} as unknown as AdapterBlueprint.GetEnsAddressResult)
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

  // -- Private ------------------------------------------ //
  private bindEvents(connector: BitcoinConnector) {
    this.unbindEvents()

    const accountsChanged = (data: string[]) => {
      const [newAccount] = data
      if (newAccount) {
        this.emit('accountChanged', {
          address: newAccount,
          chainId: this.networks[0]?.id || ''
        })
      }
    }
    connector.on('accountsChanged', accountsChanged)
    this.eventsToUnbind.push(() => connector.removeListener('accountsChanged', accountsChanged))

    const chainChanged = (data: string) => {
      this.emit('switchNetwork', { chainId: data })
    }
    connector.on('chainChanged', chainChanged)
    this.eventsToUnbind.push(() => connector.removeListener('chainChanged', chainChanged))

    const disconnect = () => {
      this.emit('disconnect')
    }
    connector.on('disconnect', disconnect)
    this.eventsToUnbind.push(() => connector.removeListener('disconnect', disconnect))
  }

  private unbindEvents() {
    this.eventsToUnbind.forEach(unsubscribe => unsubscribe())
    this.eventsToUnbind = []
  }
}

export namespace BitcoinAdapter {
  export type ConstructorParams = Omit<AdapterBlueprint.Params, 'namespace'>
}
