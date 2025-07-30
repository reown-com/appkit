import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignMessageFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature
} from '@mysten/wallet-standard'
import type { Wallet, WalletAccount, WalletWithFeatures } from '@wallet-standard/base'
import {
  StandardConnect,
  type StandardConnectFeature,
  StandardDisconnect,
  type StandardDisconnectFeature,
  StandardEvents,
  type StandardEventsFeature
} from '@wallet-standard/features'

import { type CaipNetwork } from '@reown/appkit-common'
import type { Provider as CoreProvider, RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { sui, suiDevnet, suiTestnet } from '@reown/appkit/networks'

import { WalletStandardFeatureNotSupportedError } from '../shared/Errors.js'
import { ProviderEventEmitter } from '../shared/ProviderEventEmitter.js'

export interface WalletStandardProviderConfig {
  wallet: Wallet
  getActiveChain: () => CaipNetwork | undefined
  requestedChains: CaipNetwork[]
}

type AvailableFeatures = StandardConnectFeature &
  SuiSignAndExecuteTransactionFeature &
  SuiSignTransactionFeature &
  StandardDisconnectFeature &
  SuiSignPersonalMessageFeature &
  SuiSignMessageFeature &
  StandardEventsFeature

export class WalletStandardProvider extends ProviderEventEmitter {
  readonly wallet: Wallet
  readonly getActiveChain: WalletStandardProviderConfig['getActiveChain']
  readonly chain = 'sui'
  public readonly provider = this as CoreProvider

  private readonly requestedChains: WalletStandardProviderConfig['requestedChains']

  constructor({ wallet, getActiveChain, requestedChains }: WalletStandardProviderConfig) {
    super()

    this.wallet = wallet
    this.getActiveChain = getActiveChain
    this.requestedChains = requestedChains

    this.bindEvents()
  }

  // -- Public ------------------------------------------- //
  public get id() {
    const name = this.name

    return PresetsUtil.ConnectorExplorerIds[name] || name
  }

  public get name() {
    return this.wallet.name
  }

  public get type() {
    return 'ANNOUNCED' as const
  }

  public get explorerId() {
    return PresetsUtil.ConnectorExplorerIds[this.name]
  }

  public get imageUrl() {
    return this.wallet.icon
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId =>
        this.requestedChains.find(chain => {
          switch (chainId) {
            case 'sui:mainnet':
              return chain.caipNetworkId === sui.caipNetworkId
            case 'sui:testnet':
              return chain.caipNetworkId === suiTestnet.caipNetworkId
            case 'sui:devnet':
              return chain.caipNetworkId === suiDevnet.caipNetworkId
            default:
              return chain.caipNetworkId === chainId
          }
        })
      )
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect(): Promise<string> {
    const feature = this.getWalletFeature(StandardConnect)
    await feature.connect()

    const account = this.getAccount(true)
    this.emit('connect', account.address)

    return account.address
  }

  public async disconnect() {
    const feature = this.getWalletFeature(StandardDisconnect)

    await feature.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signPersonalMessage(message: Uint8Array) {
    const feature = this.getWalletFeature('sui:signPersonalMessage')
    const account = this.getAccount(true)

    const result = await feature.signPersonalMessage({ message, account })

    if (!result) {
      throw new Error('Empty result')
    }

    return result.signature
  }

  public async signMessage(message: Uint8Array) {
    const feature = this.getWalletFeature('sui:signMessage')
    const account = this.getAccount(true)

    const result = await feature.signMessage({ message, account })

    if (!result) {
      throw new Error('Empty result')
    }

    return result.signature
  }

  public async signTransaction(transaction: any) {
    const feature = this.getWalletFeature('sui:signTransaction')
    const account = this.getAccount(true)

    const result = await feature.signTransaction({
      transaction,
      account,
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new Error('Empty result')
    }

    this.emit('pendingTransaction', undefined)

    return result
  }

  public async signAndExecuteTransaction(transaction: any) {
    const feature = this.getWalletFeature('sui:signAndExecuteTransaction')
    const account = this.getAccount(true)

    const result = await feature.signAndExecuteTransaction({
      transaction,
      account,
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new Error('Empty result')
    }

    this.emit('pendingTransaction', undefined)

    return result
  }

  public async sendTransaction() {
    throw new Error('Method not implemented for Sui.')
  }

  public async signAllTransactions(transactions: any[]) {
    const feature = this.getWalletFeature('sui:signTransaction')
    const account = this.getAccount(true)
    const chain = this.getActiveChainName()

    const results = await Promise.all(
      transactions.map(transaction => feature.signTransaction({ transaction, account, chain }))
    )

    return results
  }

  public async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new WalletStandardFeatureNotSupportedError('request'))
  }

  public async getAccounts() {
    return Promise.resolve(
      this.wallet.accounts.map(account => ({
        namespace: this.chain,
        address: account.address,
        type: 'eoa' as const
      }))
    )
  }

  // -- Private ------------------------------------------- //
  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? WalletAccount : WalletAccount | undefined {
    const account = this.wallet.accounts[0]
    if (required && !account) {
      throw new Error('No account found')
    }

    return account as Required extends true ? WalletAccount : WalletAccount | undefined
  }

  private getWalletFeature<Name extends keyof AvailableFeatures>(feature: Name) {
    if (!(feature in this.wallet.features)) {
      throw new WalletStandardFeatureNotSupportedError(feature)
    }

    return this.wallet.features[feature] as WalletWithFeatures<
      Record<Name, AvailableFeatures[Name]>
    >['features'][Name]
  }

  private getActiveChainName() {
    const activeChain = this.getActiveChain()
    if (!activeChain) {
      throw new Error('Invalid chain id')
    }

    return activeChain.id as `${string}:${string}`
  }

  private bindEvents() {
    const features = this.getWalletFeature(StandardEvents)

    features.on('change', params => {
      if (params.accounts) {
        const account = params.accounts[0]

        if (account) {
          this.emit('accountsChanged', account.address)
        }
      }
    })
  }
}
