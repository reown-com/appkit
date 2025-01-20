import type UniversalProvider from '@walletconnect/universal-provider'
import bs58 from 'bs58'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { ChainController, CoreHelperUtil } from '@reown/appkit-core'

import { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import { WalletConnectConnector } from '../connectors/WalletConnectConnector.js'

export class UniversalAdapter extends AdapterBlueprint {
  public override setUniversalProvider(universalProvider: UniversalProvider): void {
    this.addConnector(
      new WalletConnectConnector({
        provider: universalProvider,
        caipNetworks: this.caipNetworks || [],
        namespace: this.namespace as ChainNamespace
      })
    )
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return Promise.resolve({
      id: 'WALLET_CONNECT',
      type: 'WALLET_CONNECT' as const,
      chainId: Number(params.chainId),
      provider: this.provider as UniversalProvider,
      address: ''
    })
  }

  public async disconnect() {
    try {
      const connector = this.getWalletConnectConnector()
      await connector.disconnect()
    } catch (error) {
      console.warn('UniversalAdapter:disconnect - error', error)
    }
  }

  public async getAccounts({
    namespace
  }: AdapterBlueprint.GetAccountsParams & {
    namespace: ChainNamespace
  }): Promise<AdapterBlueprint.GetAccountsResult> {
    const provider = this.provider as UniversalProvider
    const addresses = (provider?.session?.namespaces?.[namespace]?.accounts
      ?.map(account => {
        const [, , address] = account.split(':')

        return address
      })
      .filter((address, index, self) => self.indexOf(address) === index) || []) as string[]

    return Promise.resolve({
      accounts: addresses.map(address =>
        CoreHelperUtil.createAccount(namespace, address, namespace === 'bip122' ? 'payment' : 'eoa')
      )
    })
  }

  public async syncConnectors() {
    return Promise.resolve()
  }

  public async getBalance(): Promise<AdapterBlueprint.GetBalanceResult> {
    return Promise.resolve({
      balance: '0',
      decimals: 0,
      symbol: ''
    })
  }

  public override async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const { provider, message, address } = params
    if (!provider) {
      throw new Error('UniversalAdapter:signMessage - provider is undefined')
    }

    let signature = ''

    if (ChainController.state.activeCaipNetwork?.chainNamespace === ConstantsUtil.CHAIN.SOLANA) {
      const response = await provider.request(
        {
          method: 'solana_signMessage',
          params: {
            message: bs58.encode(new TextEncoder().encode(message)),
            pubkey: address
          }
        },
        ChainController.state.activeCaipNetwork?.caipNetworkId
      )

      signature = (response as { signature: string }).signature
    } else {
      signature = await provider.request(
        {
          method: 'personal_sign',
          params: [message, address]
        },
        ChainController.state.activeCaipNetwork?.caipNetworkId
      )
    }

    return { signature }
  }

  // -- Transaction methods ---------------------------------------------------
  /**
   *
   * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
   * These function definition is to have a type parity between the clients. Currently not in use.
   */
  public override async estimateGas(): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    return Promise.resolve({
      gas: BigInt(0)
    })
  }

  public async getProfile(): Promise<AdapterBlueprint.GetProfileResult> {
    return Promise.resolve({
      profileImage: '',
      profileName: ''
    })
  }

  public async sendTransaction(): Promise<AdapterBlueprint.SendTransactionResult> {
    return Promise.resolve({
      hash: ''
    })
  }

  public async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    return Promise.resolve({
      hash: ''
    })
  }

  public async getEnsAddress(): Promise<AdapterBlueprint.GetEnsAddressResult> {
    return Promise.resolve({
      address: false
    })
  }

  public parseUnits(): AdapterBlueprint.ParseUnitsResult {
    return 0n
  }

  public formatUnits(): AdapterBlueprint.FormatUnitsResult {
    return '0'
  }

  public async getCapabilities(): Promise<unknown> {
    return Promise.resolve({})
  }

  public async grantPermissions(): Promise<unknown> {
    return Promise.resolve({})
  }

  public async revokePermissions(): Promise<`0x${string}`> {
    return Promise.resolve('0x')
  }

  public async syncConnection() {
    return Promise.resolve({
      id: 'WALLET_CONNECT',
      type: 'WALLET_CONNECT' as const,
      chainId: 1,
      provider: this.provider as UniversalProvider,
      address: ''
    })
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams) {
    const { caipNetwork } = params
    const connector = this.getWalletConnectConnector()
    connector.provider.setDefaultChain(caipNetwork.caipNetworkId)
  }

  public getWalletConnectProvider() {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')

    const provider = connector?.provider as UniversalProvider

    return provider
  }
}
