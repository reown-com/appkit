import type { AppKit, AppKitOptions } from '@reown/appkit'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import type { BitcoinConnector } from './utils/BitcoinConnector.js'

import { SatsConnectConnector } from './connectors/SatsConnectConnector.js'
import { WalletStandardConnector } from './connectors/WalletStandardConnector.js'

export class BitcoinAdapter extends AdapterBlueprint<BitcoinConnector> {
  constructor(params: BitcoinAdapter.ConstructorParams) {
    super({
      namespace: 'bip122',
      ...params
    })
  }

  override connectWalletConnect(
    _onUri: (uri: string) => void,
    _chainId?: string | number | undefined
  ): Promise<void> {
    // Connect to WalletConnect
    return Promise.resolve()
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

    return {
      id: connector.id,
      type: connector.type,
      address,
      chainId: this.networks[0]?.id || '',
      provider: connector.provider
    }
  }

  override switchNetwork(_params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    // Switch network
    return Promise.resolve()
  }

  override disconnect(): Promise<void> {
    // Disconnect
    return Promise.resolve()
  }

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

  override syncConnectors(_options?: AppKitOptions, _appKit?: AppKit): void {
    WalletStandardConnector.watchWallets({
      callback: this.addConnector.bind(this),
      requestedChains: this.networks
    })

    this.addConnector(
      ...SatsConnectConnector.getWallets({
        requestedChains: this.networks
      })
    )
  }

  override syncConnection(
    _params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    // Sync connection
    return Promise.resolve({} as unknown as AdapterBlueprint.ConnectResult)
  }

  override async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = this.connector
    if (!connector) {
      throw new Error('BitcoinAdapter:signMessage - connector is undefined')
    }

    const signature = await connector.signMessage({
      message: params.message,
      address: params.address
    })

    return { signature }
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

  override getWalletConnectProvider(
    _params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    // Get WalletConnect provider
    return undefined
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
}

export namespace BitcoinAdapter {
  export type ConstructorParams = Omit<AdapterBlueprint.Params, 'namespace'>
}
