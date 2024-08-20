import {
  isVersionedTransaction,
  WalletAccountError,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError
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
import {
  type AnyTransaction,
  type Chain,
  type GetActiveChain,
  type Provider
} from '../utils/scaffold/index.js'
import base58 from 'bs58'
import { WalletStandardFeatureNotSupportedError } from './shared/Errors.js'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import { solanaChains } from '../utils/chains.js'

export interface WalletStandardProviderConfig {
  wallet: Wallet
  getActiveChain: GetActiveChain
}

type AvailableFeatures = StandardConnectFeature &
  SolanaSignAndSendTransactionFeature &
  SolanaSignTransactionFeature &
  StandardDisconnectFeature &
  SolanaSignMessageFeature &
  SolanaSignInFeature &
  StandardEventsFeature

export class WalletStandardProvider extends ProviderEventEmitter implements Provider {
  readonly wallet: Wallet
  readonly getActiveChain: WalletStandardProviderConfig['getActiveChain']

  constructor({ wallet, getActiveChain }: WalletStandardProviderConfig) {
    super()

    this.wallet = wallet
    this.getActiveChain = getActiveChain

    this.bindEvents()
  }

  // -- Public ------------------------------------------- //
  public get name() {
    return this.wallet.name
  }

  public get type() {
    const FILTER_OUT_ADAPTERS = ['Trust']

    if (FILTER_OUT_ADAPTERS.includes(this.wallet.name)) {
      return 'EXTERNAL'
    }

    return 'ANNOUNCED'
  }

  public get publicKey() {
    const account = this.getAccount(false)

    if (account) {
      return new PublicKey(account.publicKey)
    }

    return undefined
  }

  public get icon() {
    return this.wallet.icon
  }

  public get chains() {
    return this.wallet.chains.map(chainId => solanaChains[chainId]).filter(Boolean) as Chain[]
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
      transaction: serializedTransaction,
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new WalletSignTransactionError('Empty result')
    }

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
      transaction: this.serializeTransaction(transaction),
      options: {
        ...sendOptions,
        preflightCommitment: getCommitment(sendOptions?.preflightCommitment)
      },
      chain: this.getActiveChainName()
    })

    if (!result) {
      throw new WalletSendTransactionError('Empty result')
    }

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
      ([, chain]) => chain.chainId === this.getActiveChain()?.chainId
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
