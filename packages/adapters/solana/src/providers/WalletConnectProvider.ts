import UniversalProvider from '@walletconnect/universal-provider'
import { SolConstantsUtil } from '@reown/appkit-utils/solana'
import type { AnyTransaction, Provider } from '@reown/appkit-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
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
import type { CaipNetwork, ChainId } from '@reown/appkit-common'
import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'
import { WcHelpersUtil } from '@reown/appkit'
import { WalletConnectMethodNotSupportedError } from './shared/Errors.js'

export type WalletConnectProviderConfig = {
  provider: UniversalProvider
  chains: CaipNetwork[]
  getActiveChain: () => CaipNetwork | undefined
}

export class WalletConnectProvider extends ProviderEventEmitter implements Provider {
  public readonly name = 'WalletConnect'
  public readonly type = 'WALLET_CONNECT'
  public readonly icon =
    'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/05338e12-4f75-4982-4e8a-83c67b826b00/md'
  public session?: SessionTypes.Struct
  public provider: UniversalProvider

  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super()
    this.requestedChains = chains
    this.provider = provider
    this.getActiveChain = getActiveChain
    if (this.provider.session) {
      this.session = this.provider.session
    }
  }

  // -- Universal Provider Events ------------------------ //
  public onUri?: (uri: string) => void

  // -- Public ------------------------------------------- //

  public get chains() {
    return this.sessionChains
      .map(sessionChainId => {
        // This is a workaround for wallets that only accept Solana deprecated networks
        let chainId = sessionChainId
        if (chainId === SolConstantsUtil.CHAIN_IDS.Deprecated_Mainnet) {
          chainId = SolConstantsUtil.CHAIN_IDS.Mainnet
        } else if (chainId === SolConstantsUtil.CHAIN_IDS.Deprecated_Devnet) {
          chainId = SolConstantsUtil.CHAIN_IDS.Devnet
        }

        return this.requestedChains.find(
          chain => withSolanaNamespace(chain.id as string) === chainId
        )
      })
      .filter(Boolean) as CaipNetwork[]
  }

  public get publicKey() {
    const account = this.getAccount(false)

    if (account) {
      return new PublicKey(account.publicKey)
    }

    return undefined
  }

  public async connect() {
    const rpcMap = this.requestedChains.reduce<Record<string, string>>((acc, chain) => {
      acc[withSolanaNamespace(chain.id as string)] = chain.rpcUrls.default.http[0] || ''

      return acc
    }, {})

    if (this.provider.session?.namespaces['solana']) {
      this.session = this.provider.session
    } else {
      this.provider.on('display_uri', this.onUri)
      this.session = await this.provider.connect({
        optionalNamespaces: {
          solana: {
            // Double check these with Felipe
            chains: this.getRequestedChainsWithDeprecated() as string[],
            methods: [
              'solana_signMessage',
              'solana_signTransaction',
              'solana_signAndSendTransaction',
              'solana_signAllTransactions'
            ],
            events: [],
            rpcMap
          }
        }
      })
      this.provider.removeListener('display_uri', this.onUri)
    }

    const account = this.getAccount(true)

    this.emit('connect', new PublicKey(account.publicKey))

    return account.address
  }

  public async disconnect() {
    await this.provider?.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    this.checkIfMethodIsSupported('solana_signMessage')

    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(message),
      pubkey: this.getAccount(true).address
    })

    return base58.decode(signedMessage.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    this.checkIfMethodIsSupported('solana_signTransaction')

    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.request('solana_signTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getAccount(true).address,
      ...this.getRawRPCParams(transaction)
    })

    // If the result contains signature is the old RPC response
    if ('signature' in result) {
      transaction.addSignature(
        new PublicKey(this.getAccount(true).publicKey),
        Buffer.from(base58.decode(result.signature))
      )

      return transaction
    }

    const decodedTransaction = Buffer.from(result.transaction, 'base64')

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(decodedTransaction) as T
    }

    return Transaction.from(decodedTransaction) as T
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    this.checkIfMethodIsSupported('solana_signAndSendTransaction')

    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.request('solana_signAndSendTransaction', {
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

      const result = await this.request('solana_signAllTransactions', {
        transactions: transactions.map(transaction => this.serializeTransaction(transaction))
      })

      return result.transactions.map((serializedTransaction, index) => {
        const transaction = transactions[index]

        if (!transaction) {
          throw new Error('Invalid transactions response')
        }

        const decodedTransaction = Buffer.from(serializedTransaction, 'base64')

        if (isVersionedTransaction(transaction)) {
          return VersionedTransaction.deserialize(decodedTransaction)
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

  // -- Private ------------------------------------------ //
  private request<Method extends WalletConnectProvider.RequestMethod>(
    method: Method,
    params: WalletConnectProvider.RequestMethods[Method]['params']
  ) {
    const chain = this.chains.find(c => this.getActiveChain()?.id === c.id)

    // This is a workaround for wallets that only accept Solana deprecated networks
    let chainId = withSolanaNamespace(chain?.id)

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

    return this.provider?.request<WalletConnectProvider.RequestMethods[Method]['returns']>(
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
    return Buffer.from(transaction.serialize({ verifySignatures: false })).toString('base64')
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

  /**
   * This method is a workaround for wallets that only accept Solana deprecated networks
   */
  private getRequestedChainsWithDeprecated() {
    const chains = this.requestedChains.map(chain => withSolanaNamespace<ChainId>(chain.id))

    if (chains.includes(SolConstantsUtil.CHAIN_IDS.Mainnet)) {
      chains.push(SolConstantsUtil.CHAIN_IDS.Deprecated_Mainnet)
    }

    if (chains.includes(SolConstantsUtil.CHAIN_IDS.Devnet)) {
      chains.push(SolConstantsUtil.CHAIN_IDS.Deprecated_Devnet)
    }

    return chains
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
        data: base58.encode(instruction.data),
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

  private checkIfMethodIsSupported(method: WalletConnectProvider.RequestMethod) {
    if (!this.session?.namespaces['solana']?.methods.includes(method)) {
      throw new WalletConnectMethodNotSupportedError(method)
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
