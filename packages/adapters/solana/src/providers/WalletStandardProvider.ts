import {
  WalletAccountError,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
  isVersionedTransaction
} from '@solana/wallet-adapter-base'
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignInFeature,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature
} from '@solana/wallet-standard-features'
import { getCommitment } from '@solana/wallet-standard-util'
import type { Connection, SendOptions } from '@solana/web3.js'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import type { Wallet, WalletAccount, WalletWithFeatures } from '@wallet-standard/base'
import {
  StandardConnect,
  type StandardConnectFeature,
  StandardDisconnect,
  type StandardDisconnectFeature,
  StandardEvents,
  type StandardEventsFeature
} from '@wallet-standard/features'
import base58 from 'bs58'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import type { RequestArguments } from '@reown/appkit-controllers'
import type { Provider as CoreProvider } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import type {
  AnyTransaction,
  GetActiveChain,
  Provider as SolanaProvider
} from '@reown/appkit-utils/solana'

import { solanaChains } from '../utils/chains.js'
import { WalletStandardFeatureNotSupportedError } from './shared/Errors.js'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'

export interface WalletStandardProviderConfig {
  wallet: Wallet
  getActiveChain: GetActiveChain
  requestedChains: CaipNetwork[]
}

type AvailableFeatures = StandardConnectFeature &
  SolanaSignAndSendTransactionFeature &
  SolanaSignTransactionFeature &
  StandardDisconnectFeature &
  SolanaSignMessageFeature &
  SolanaSignInFeature &
  StandardEventsFeature

export class WalletStandardProvider extends ProviderEventEmitter implements SolanaProvider {
  readonly wallet: Wallet
  readonly getActiveChain: WalletStandardProviderConfig['getActiveChain']
  readonly chain = ConstantsUtil.CHAIN.SOLANA
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
    if (this.wallet.name === 'Trust') {
      // The wallets from our list of wallets have not matching with the extension name
      return 'Trust Wallet'
    }

    return this.wallet.name
  }

  public get type() {
    return 'ANNOUNCED' as const
  }

  public get explorerId() {
    return PresetsUtil.ConnectorExplorerIds[this.name]
  }

  public get publicKey() {
    const account = this.getAccount(false)

    if (account) {
      return new PublicKey(account.publicKey)
    }

    return undefined
  }

  public get imageUrl() {
    return this.wallet.icon
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId =>
        this.requestedChains.find(
          chain => chain.id === chainId || chain.id === solanaChains[chainId]?.id
        )
      )
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect(): Promise<string> {
    const feature = this.getWalletFeature(StandardConnect)
    await feature.connect()

    const account = this.getAccount(true)
    const publicKey = new PublicKey(account.publicKey)
    this.emit('connect', publicKey)

    return account.address
  }

  public async disconnect() {
    const feature = this.getWalletFeature(StandardDisconnect)

    await feature.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const feature = this.getWalletFeature(SolanaSignMessage)
    const account = this.getAccount(true)

    const [result] = await feature.signMessage({ message, account })
    if (!result) {
      throw new WalletSignMessageError('Empty result')
    }

    return result.signature
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    const feature = this.getWalletFeature(SolanaSignTransaction)
    const account = this.getAccount(true)

    const serializedTransaction = this.serializeTransaction(transaction)

    const [result] = await feature.signTransaction({
      account,
      transaction: new Uint8Array(serializedTransaction),
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new WalletSignTransactionError('Empty result')
    }

    this.emit('pendingTransaction', undefined)

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(result.signedTransaction) as T
    }

    return Transaction.from(result.signedTransaction) as T
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    const feature = this.getWalletFeature(SolanaSignAndSendTransaction)
    const account = this.getAccount(true)

    const [result] = await feature.signAndSendTransaction({
      account,
      transaction: new Uint8Array(this.serializeTransaction(transaction)),
      options: {
        ...sendOptions,
        preflightCommitment: getCommitment(sendOptions?.preflightCommitment)
      },
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new WalletSendTransactionError('Empty result')
    }

    this.emit('pendingTransaction', undefined)

    return base58.encode(result.signature)
  }

  public async sendTransaction(
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendOptions
  ) {
    const signedTransaction = await this.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), options)

    return signature
  }

  public async signAllTransactions<T extends AnyTransaction[]>(transactions: T): Promise<T> {
    const feature = this.getWalletFeature(SolanaSignTransaction)

    const account = this.getAccount(true)
    const chain = this.getActiveChainName()

    const result = await feature.signTransaction(
      ...transactions.map(transaction => ({
        transaction: new Uint8Array(this.serializeTransaction(transaction)),
        account,
        chain
      }))
    )

    return result.map(({ signedTransaction }, index) => {
      const transaction = transactions[index]

      if (!transaction) {
        throw new WalletSignTransactionError('Invalid transaction signature response')
      }

      this.emit('pendingTransaction', undefined)

      if (isVersionedTransaction(transaction)) {
        return VersionedTransaction.deserialize(signedTransaction)
      }

      return Transaction.from(signedTransaction)
    }) as T
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
  private serializeTransaction(transaction: AnyTransaction) {
    return transaction.serialize({ verifySignatures: false })
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? WalletAccount : WalletAccount | undefined {
    const account = this.wallet.accounts[0]
    if (required && !account) {
      throw new WalletAccountError()
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
    const entry = Object.entries(solanaChains).find(
      ([, chain]) => chain.id === this.getActiveChain()?.id
    )

    if (!entry) {
      throw new Error('Invalid chain id')
    }

    return entry[0] as `${string}:${string}`
  }

  private bindEvents() {
    const features = this.getWalletFeature(StandardEvents)

    features.on('change', params => {
      if (params.accounts) {
        const account = params.accounts[0]

        if (account) {
          this.emit('accountsChanged', new PublicKey(account.publicKey))
        }
      }
    })
  }
}
