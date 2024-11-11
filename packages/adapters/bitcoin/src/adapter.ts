import type { AppKit, AppKitOptions } from '@reown/appkit'
import { AdapterBlueprint } from '@reown/appkit/adapters'

export class BitcoinAdapter extends AdapterBlueprint {
  override connectWalletConnect(
    _onUri: (uri: string) => void,
    _chainId?: string | number | undefined
  ): Promise<void> {
    // Connect to WalletConnect
    return Promise.resolve()
  }

  override connect(
    _params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    // Connect to Metamask
    return Promise.resolve({} as unknown as AdapterBlueprint.ConnectResult)
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
    // Sync connectors
  }

  override syncConnection(
    _params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    // Sync connection
    return Promise.resolve({} as unknown as AdapterBlueprint.ConnectResult)
  }

  override signMessage(
    _params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    // Sign message
    return Promise.resolve({} as unknown as AdapterBlueprint.SignMessageResult)
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
}
