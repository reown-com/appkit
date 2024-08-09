import type { IUniversalProvider as UniversalProvider } from '@walletconnect/universal-provider'
import type { AnyTransaction, Chain, Provider } from '../../utils/scaffold'
import { ProviderEventEmitter } from '../shared/ProviderEventEmitter'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { SessionTypes } from '@walletconnect/types'
import base58 from 'bs58'
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  type SendOptions
} from '@solana/web3.js'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'

export type WalletConnectProviderConfig = {
  provider: UniversalProvider
  chains: Chain[]
}

export class WalletConnectProvider extends ProviderEventEmitter implements Provider {
  public readonly name = ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
  public readonly chains: Chain[]

  private provider: UniversalProvider
  private session?: SessionTypes.Struct

  constructor({ provider, chains }: WalletConnectProviderConfig) {
    super()
    this.chains = chains
    this.provider = provider
  }

  // -- Public ------------------------------------------- //
  public get publicKey() {
    const account = this.getAccount(false)

    if (account) {
      return new PublicKey(account.publicKey)
    }

    return undefined
  }

  public async connect() {
    const rpcMap = this.chains.reduce<Record<string, string>>((acc, chain) => {
      acc[chain.chainId] = chain.rpcUrl

      return acc
    }, {})

    this.session = await this.provider.connect({
      namespaces: {
        solana: {
          chains: this.chains.map(chain => chain.chainId),
          methods: [
            'solana_signMessage',
            'solana_signTransaction',
            'solana_signAndSendTransaction'
          ],
          events: [],
          rpcMap
        }
      }
    })

    const account = this.getAccount(true)
    this.emit('connect', new PublicKey(account.publicKey))

    return account.address
  }

  public async disconnect() {
    await this.provider.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(message),
      pubkey: this.getAccount(true).address
    })

    return base58.decode(signedMessage.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.request('solana_signTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getAccount(true).address
    })

    const decodedTransaction = base58.decode(result.transaction)

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(decodedTransaction) as T
    }

    return Transaction.from(decodedTransaction) as T
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.request('solana_signAndSendTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getAccount(true).address,
      sendOptions
    })

    return result.signature
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

  public async signAllTransactions() {
    return await Promise.reject(new Error('Sign all transactions is not supported'))
  }

  // -- Private ------------------------------------------ //
  private request<Method extends WalletConnectProvider.RequestMethod>(
    method: Method,
    params: WalletConnectProvider.RequestMethods[Method]['params']
  ) {
    return this.provider.request<WalletConnectProvider.RequestMethods[Method]['returns']>({
      method,
      params
    })
  }

  private serializeTransaction(transaction: AnyTransaction) {
    return base58.encode(transaction.serialize({ verifySignatures: false }))
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true
    ? WalletConnectProvider.Account
    : WalletConnectProvider.Account | undefined {
    const account = this.session?.namespaces['solana']?.accounts[0]
    if (!account) {
      if (required) {
        throw new Error('Account not found')
      }

      return undefined as Required extends true
        ? WalletConnectProvider.Account
        : WalletConnectProvider.Account | undefined
    }

    const address = account.split(':')[2]
    if (!address) {
      if (required) {
        throw new Error('Address not found')
      }

      return undefined as Required extends true
        ? WalletConnectProvider.Account
        : WalletConnectProvider.Account | undefined
    }

    return {
      address,
      publicKey: base58.decode(address)
    }
  }
}

export namespace WalletConnectProvider {
  export type Request<Params, Result> = {
    params: Params
    returns: Result
  }

  export type RequestMethods = {
    solana_signMessage: Request<{ message: string; pubkey: string }, { signature: string }>
    solana_signTransaction: Request<
      { transaction: string; pubkey: string },
      { transaction: string }
    >
    solana_signAndSendTransaction: Request<
      { transaction: string; pubkey: string; sendOptions?: SendOptions },
      { signature: string }
    >
  }

  export type RequestMethod = keyof RequestMethods

  export type Account = {
    address: string
    publicKey: Uint8Array
  }
}
