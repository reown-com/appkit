import type UniversalProvider from '@walletconnect/universal-provider'

import { ConstantsUtil } from '@reown/appkit-common'
import { type TonConnector } from '@reown/appkit-utils/ton'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { ton } from '@reown/appkit/networks'

import { TonConnectConnector } from './connectors/TonConnectConnector'

// @ts-expect-error will fix
export class TonAdapter extends AdapterBlueprint<TonConnector> {
  constructor(params?: AdapterBlueprint.Params) {
    super({
      namespace: ConstantsUtil.CHAIN.TON,
      ...params
    })
  }

  override async syncConnectors() {
    const { TonConnect } = await import('@tonconnect/sdk')
    const wallets = await TonConnect.getWallets()

    wallets.forEach(wallet => {
      const connector = new TonConnectConnector({
        wallet,
        chains: this.getCaipNetworks()
      })

      // @ts-ignore
      this.addConnector(connector)
    })
  }

  override async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      throw new Error('Connector not found')
    }
    const address = await connector.connect({ chainId: params.chainId as string })
    // Set connection, emit events, etc.
    // Mirror logic from BitcoinAdapter
    const chainId = params.chainId || ton.caipNetworkId
    // @ts-expect-error will fix
    this.emit('accountChanged', { address, chainId, connector })
    this.connector = connector // Set active connector

    return {
      id: connector.id,
      address,
      chainId,
      // @ts-ignore
      provider: connector,
      type: connector.type
    }
  }

  protected getActiveConnector(): TonConnector | undefined {
    return this.connector
  }

  override async getAccounts(): Promise<AdapterBlueprint.GetAccountsResult> {
    return { accounts: [] }
  }

  override async signMessage(): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = this.getActiveConnector()
    if (!connector) throw new Error('No active connector')

    // @ts-ignore
    return connector.signMessage({} as any)
  }

  override async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    const connector = this.getActiveConnector()
    if (!connector) throw new Error('No active connector')

    // @ts-ignore
    return connector.sendTransaction({ transaction: {} as any })
  }

  override async disconnect(): Promise<AdapterBlueprint.DisconnectResult> {
    const connector = this.getActiveConnector()

    if (connector) {
      await connector.disconnect()
    }

    this.connector = undefined // Clear active connector

    // Clean up
    return { connections: [] }
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const connector = this.getActiveConnector()

    if (connector) {
      await connector.switchNetwork(params.caipNetwork.caipNetworkId)
    }
  }

  override async getBalance(): Promise<AdapterBlueprint.GetBalanceResult> {
    // Implement using TON RPC
    return { balance: '0', symbol: 'TON' } // Placeholder
  }

  // Other methods as empty or throw 'Not supported for TON'
  override parseUnits(): bigint {
    // Implement if needed
    return BigInt(0)
  }

  override formatUnits(): string {
    return ''
  }

  override async setUniversalProvider(_universalProvider: UniversalProvider) {
    // TODO: Implement if WC support for TON is added
    return Promise.resolve()
  }

  override async syncConnections(_params: AdapterBlueprint.SyncConnectionsParams): Promise<void> {
    return Promise.resolve()
  }

  override async syncConnection(): Promise<AdapterBlueprint.ConnectResult> {
    return { id: '', address: '', chainId: '', provider: undefined, type: 'EXTERNAL' } // Placeholder
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

  override getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    // TODO: Implement if needed
    return undefined // Placeholder
  }

  // For QR and universal link handling, TBD
}
