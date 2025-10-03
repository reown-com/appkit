import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import {
  Connection,
  PublicKey,
  type SendOptions,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js'
import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'
import base58 from 'bs58'

import { type RequestArguments } from '@reown/appkit'
import { type CaipAddress, type CaipNetwork, ParseUtil } from '@reown/appkit-common'
import { AssetController, WalletConnectConnector, WcHelpersUtil } from '@reown/appkit-controllers'
import { SolConstantsUtil } from '@reown/appkit-utils/solana'
import type {
  AnyTransaction,
  Provider,
  ProviderEventEmitterMethods
} from '@reown/appkit-utils/solana'

import { WalletConnectMethodNotSupportedError } from './shared/Errors.js'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: UniversalProvider
  chains: CaipNetwork[]
  getActiveChain: () => CaipNetwork | undefined
}

export class SolanaWalletConnectProvider
  extends WalletConnectConnector<'solana'>
  implements Omit<Provider, 'connect'>, ProviderEventEmitterMethods
{
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']
  private readonly eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)
  readonly #version = '1.0.0' as const

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super({ caipNetworks: chains, namespace: 'solana', provider })
    this.getActiveChain = getActiveChain
  }

  // -- Public ------------------------------------------- //
  public get session(): SessionTypes.Struct | undefined {
    return this.provider.session
  }

  public override get chains() {
    return this.sessionChains
      .map(sessionChainId => {
        // This is a workaround for wallets that only accept Solana deprecated networks
        let chainId = sessionChainId
        if (chainId === SolConstantsUtil.CHAIN_IDS.Deprecated_Mainnet) {
          chainId = SolConstantsUtil.CHAIN_IDS.Mainnet
        } else if (chainId === SolConstantsUtil.CHAIN_IDS.Deprecated_Devnet) {
          chainId = SolConstantsUtil.CHAIN_IDS.Devnet
        }

        return this.caipNetworks.find(chain => chain.caipNetworkId === chainId)
      })
      .filter(Boolean) as CaipNetwork[]
  }

  public get icon() {
    return AssetController.state.connectorImages[this.id]
  }

  public get version() {
    return this.#version
  }

  public get publicKey() {
    const account = this.getAccount(false)

    if (account) {
      return new PublicKey(account.publicKey)
    }

    return undefined
  }

  public async connect() {
    await super.connectWalletConnect()

    const account = this.getAccount(true)

    this.emit('connect', new PublicKey(account.publicKey))

    return account.address
  }

  public override async disconnect() {
    await super.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    this.checkIfMethodIsSupported('solana_signMessage')

    const signedMessage = await this.internalRequest('solana_signMessage', {
      message: base58.encode(message),
      pubkey: this.getAccount(true).address
    })

    return base58.decode(signedMessage.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    this.checkIfMethodIsSupported('solana_signTransaction')

    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.internalRequest('solana_signTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getAccount(true).address,
      ...this.getRawRPCParams(transaction)
    })

    // If the result contains signature is the old RPC response
    if ('signature' in result) {
      const decoded = base58.decode(result.signature)
      transaction.addSignature(
        new PublicKey(this.getAccount(true).publicKey),
        Buffer.from(decoded) as Buffer & Uint8Array
      )

      return transaction
    }

    const decodedTransaction = Buffer.from(result.transaction, 'base64')

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(new Uint8Array(decodedTransaction)) as T
    }

    return Transaction.from(decodedTransaction) as T
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    this.checkIfMethodIsSupported('solana_signAndSendTransaction')

    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.internalRequest('solana_signAndSendTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getAccount(true).address,
      sendOptions
    })

    this.emit('pendingTransaction', undefined)

    return result.signature
  }

  public async sendTransaction(
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendOptions
  ) {
    const signedTransaction = await this.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), options)

    this.emit('pendingTransaction', undefined)

    return signature
  }

  public async signAllTransactions<T extends AnyTransaction[]>(transactions: T): Promise<T> {
    try {
      this.checkIfMethodIsSupported('solana_signAllTransactions')

      const result = await this.internalRequest('solana_signAllTransactions', {
        transactions: transactions.map(transaction => this.serializeTransaction(transaction))
      })

      return result.transactions.map((serializedTransaction, index) => {
        const transaction = transactions[index]

        if (!transaction) {
          throw new Error('Invalid transactions response')
        }

        const decodedTransaction = Buffer.from(serializedTransaction, 'base64')

        if (isVersionedTransaction(transaction)) {
          return VersionedTransaction.deserialize(new Uint8Array(decodedTransaction))
        }

        this.emit('pendingTransaction', undefined)

        return Transaction.from(decodedTransaction)
      }) as T
    } catch (error) {
      if (error instanceof WalletConnectMethodNotSupportedError) {
        const signedTransactions = [] as AnyTransaction[] as T

        for (const transaction of transactions) {
          // eslint-disable-next-line no-await-in-loop
          signedTransactions.push(await this.signTransaction(transaction))
        }

        return signedTransactions
      }

      throw error
    }
  }

  public request<T>(args: RequestArguments): Promise<T> {
    // @ts-expect-error - There is a miss match in `args` from CoreProvider and internalRequest
    return this.internalRequest(args.method, args.params)
  }

  public async getAccounts() {
    const accounts = (this.session?.namespaces['solana']?.accounts || []) as CaipAddress[]

    return Promise.resolve(
      accounts.map(account => ({
        namespace: this.chain,
        address: ParseUtil.parseCaipAddress(account).address,
        type: 'eoa' as const
      }))
    )
  }

  public setDefaultChain(chainId: string) {
    this.provider.setDefaultChain(chainId)
  }

  // -- Private ------------------------------------------ //
  private internalRequest<Method extends SolanaWalletConnectProvider.RequestMethod>(
    method: Method,
    params: SolanaWalletConnectProvider.RequestMethods[Method]['params']
  ) {
    const chain = this.chains.find(c => this.getActiveChain()?.id === c.id)

    // This is a workaround for wallets that only accept Solana deprecated networks
    let chainId = chain?.caipNetworkId

    switch (chainId) {
      case SolConstantsUtil.CHAIN_IDS.Mainnet:
        if (!this.sessionChains.includes(SolConstantsUtil.CHAIN_IDS.Mainnet)) {
          chainId = SolConstantsUtil.CHAIN_IDS.Deprecated_Mainnet
        }
        break
      case SolConstantsUtil.CHAIN_IDS.Devnet:
        if (!this.sessionChains.includes(SolConstantsUtil.CHAIN_IDS.Devnet)) {
          chainId = SolConstantsUtil.CHAIN_IDS.Deprecated_Devnet
        }
        break
      default:
        break
    }

    return this.provider?.request<SolanaWalletConnectProvider.RequestMethods[Method]['returns']>(
      {
        method,
        params
      },
      chainId
    )
  }

  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.session?.namespaces)
  }

  private serializeTransaction(transaction: AnyTransaction) {
    /*
     * We should consider serializing the transaction to base58 as it is the solana standard.
     * But our specs requires base64 right now:
     * https://docs.reown.com/advanced/multichain/rpc-reference/solana-rpc#solana_signtransaction
     */
    return Buffer.from(new Uint8Array(transaction.serialize({ verifySignatures: false }))).toString(
      'base64'
    )
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true
    ? SolanaWalletConnectProvider.Account
    : SolanaWalletConnectProvider.Account | undefined {
    const account = this.session?.namespaces['solana']?.accounts[0]
    if (!account) {
      if (required) {
        throw new Error('Account not found')
      }

      return undefined as Required extends true
        ? SolanaWalletConnectProvider.Account
        : SolanaWalletConnectProvider.Account | undefined
    }

    const address = account.split(':')[2]
    if (!address) {
      if (required) {
        throw new Error('Address not found')
      }

      return undefined as Required extends true
        ? SolanaWalletConnectProvider.Account
        : SolanaWalletConnectProvider.Account | undefined
    }

    return {
      address,
      publicKey: base58.decode(address)
    }
  }

  /*
   * This is a deprecated method that is used to support older versions of the
   * WalletConnect RPC API. It should be removed in the future
   */
  private getRawRPCParams(transaction: AnyTransaction) {
    if (isVersionedTransaction(transaction)) {
      return {}
    }

    return {
      feePayer: transaction.feePayer?.toBase58() ?? '',
      instructions: transaction.instructions.map(instruction => ({
        data: base58.encode(new Uint8Array(instruction.data)),
        keys: instruction.keys.map(key => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58()
        })),
        programId: instruction.programId.toBase58()
      })),
      recentBlockhash: transaction.recentBlockhash ?? ''
    }
  }

  private checkIfMethodIsSupported(method: SolanaWalletConnectProvider.RequestMethod) {
    if (!this.session?.namespaces['solana']?.methods.includes(method)) {
      throw new WalletConnectMethodNotSupportedError(method)
    }
  }
}

export namespace SolanaWalletConnectProvider {
  export type Request<Params, Result> = {
    params: Params
    returns: Result
  }

  export type RequestMethods = {
    solana_signMessage: Request<{ message: string; pubkey: string }, { signature: string }>
    solana_signTransaction: Request<
      { transaction: string; pubkey: string },
      { signature: string } | { transaction: string }
    >
    solana_signAndSendTransaction: Request<
      { transaction: string; pubkey: string; sendOptions?: SendOptions },
      { signature: string }
    >
    solana_signAllTransactions: Request<{ transactions: string[] }, { transactions: string[] }>
  }

  export type RequestMethod = keyof RequestMethods

  export type Account = {
    address: string
    publicKey: Uint8Array
  }
}
