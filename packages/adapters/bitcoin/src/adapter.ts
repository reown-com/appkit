import type UniversalProvider from '@walletconnect/universal-provider'

import { type AppKit, type AppKitOptions, CoreHelperUtil, type Provider } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { ChainController, StorageUtil } from '@reown/appkit-controllers'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { bitcoin } from '@reown/appkit/networks'

import { BitcoinWalletConnectConnector } from './connectors/BitcoinWalletConnectConnector.js'
import { LeatherConnector } from './connectors/LeatherConnector.js'
import { OKXConnector } from './connectors/OKXConnector.js'
import { SatsConnectConnector } from './connectors/SatsConnectConnector.js'
import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'
import { BitcoinApi } from './utils/BitcoinApi.js'
import type { BitcoinConnector } from './utils/BitcoinConnector.js'
import { UnitsUtil } from './utils/UnitsUtil.js'

export class BitcoinAdapter extends AdapterBlueprint<BitcoinConnector> {
  private eventsToUnbind: (() => void)[] = []
  private api: BitcoinApi.Interface
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

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

    this.connector = connector
    this.bindEvents(this.connector)

    const address = await connector.connect()

    const chain = connector.chains.find(c => c.id === params.chainId) || connector.chains[0]

    if (!chain) {
      throw new Error('The connector does not support any of the requested chains')
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

    const accounts = addresses?.map(a =>
      CoreHelperUtil.createAccount(
        ConstantsUtil.CHAIN.BITCOIN,
        a.address,
        a.purpose || 'payment',
        a.publicKey,
        a.path
      )
    )

    return {
      accounts: accounts || []
    }
  }

  override syncConnectors(_options?: AppKitOptions, appKit?: AppKit) {
    function getActiveNetwork() {
      return appKit?.getCaipNetwork()
    }

    WalletStandardConnector.watchWallets({
      callback: this.addConnector.bind(this),
      requestedChains: this.networks
    })

    this.addConnector(
      ...SatsConnectConnector.getWallets({
        requestedChains: this.networks,
        getActiveNetwork
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

    const okxConnector = OKXConnector.getWallet({
      requestedChains: this.networks,
      getActiveNetwork
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

  override async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    if (params?.provider) {
      await params.provider.disconnect()
    } else if (this.connector) {
      await this.connector.disconnect()
    }
    this.unbindEvents()
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
  // -- Private ------------------------------------------ //
  private bindEvents(connector: BitcoinConnector) {
    this.unbindEvents()

    const accountsChanged = (data: string[]) => {
      const [newAccount] = data
      if (newAccount) {
        this.emit('accountChanged', {
          address: newAccount
        })
      }
    }
    connector.on('accountsChanged', accountsChanged)
    this.eventsToUnbind.push(() => connector.removeListener('accountsChanged', accountsChanged))

    const chainChanged = async (data: string) => {
      const address = await this.connect({
        id: connector.id,
        chainId: data,
        type: ''
      })
      this.emit('switchNetwork', { chainId: data, address: address.address })
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

  public override setUniversalProvider(universalProvider: UniversalProvider): void {
    this.addConnector(
      new BitcoinWalletConnectConnector({
        provider: universalProvider,
        chains: this.getCaipNetworks(),
        getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
      })
    )
  }
}

export namespace BitcoinAdapter {
  export type ConstructorParams = Omit<AdapterBlueprint.Params, 'namespace'> & {
    api?: Partial<BitcoinApi.Interface>
  }
}
