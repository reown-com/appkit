import UniversalProvider from '@walletconnect/universal-provider'
import {
  SolConstantsUtil,
  type AnyTransaction,
  type Provider
} from '@web3modal/scaffold-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import type { SessionTypes } from '@walletconnect/types'
import base58 from 'bs58'
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  type SendOptions
} from '@solana/web3.js'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import type { CaipNetwork, ChainId } from '@web3modal/common'
import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'

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

  private provider: UniversalProvider
  private session?: SessionTypes.Struct
  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: WalletConnectProviderConfig['getActiveChain']

  constructor({ provider, chains, getActiveChain }: WalletConnectProviderConfig) {
    super()
    this.requestedChains = chains
    this.provider = provider
    this.getActiveChain = getActiveChain
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
          chain => withSolanaNamespace(chain.chainId as string) === chainId
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
      acc[withSolanaNamespace(chain.chainId as string)] = chain.rpcUrl

      return acc
    }, {})

    if (this.provider.session) {
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
              'solana_signAndSendTransaction'
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

  // -- Private ------------------------------------------ //
  private request<Method extends WalletConnectProvider.RequestMethod>(
    method: Method,
    params: WalletConnectProvider.RequestMethods[Method]['params']
  ) {
    const chain = this.chains.find(c => this.getActiveChain()?.chainId === c.chainId)

    // This is a workaround for wallets that only accept Solana deprecated networks
    let chainId = withSolanaNamespace(chain?.chainId)

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
    return this.session?.namespaces['solana']?.chains || []
  }

  private serializeTransaction(transaction: AnyTransaction) {
    /*
     * We should consider serializing the transaction to base58 as it is the solana standard.
     * But our specs requires base64 right now:
     * https://docs.walletconnect.com/advanced/multichain/rpc-reference/solana-rpc#solana_signtransaction
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
    const chains = this.requestedChains.map(chain => withSolanaNamespace<ChainId>(chain.chainId))

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
  private getRawRPCParams(_transaction: AnyTransaction) {
    let transaction = _transaction

    if (isVersionedTransaction(transaction)) {
      const instructions = TransactionMessage.decompile(transaction.message).instructions
      const legacyMessage = new TransactionMessage({
        payerKey: new PublicKey(this.getAccount(true).publicKey),
        recentBlockhash: transaction.message.recentBlockhash,
        instructions: [...instructions]
      }).compileToLegacyMessage()

      transaction = Transaction.populate(legacyMessage)
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
  }

  export type RequestMethod = keyof RequestMethods

  export type Account = {
    address: string
    publicKey: Uint8Array
  }
}
