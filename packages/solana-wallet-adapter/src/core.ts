import { WalletConnectionError, isVersionedTransaction } from '@solana/wallet-adapter-base'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import type { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { parseAccountId } from '@walletconnect/utils'
import base58 from 'bs58'

import type { AppKit } from '@reown/appkit/core'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

import { WalletConnectRPCMethods } from './constants.js'
import type { WalletConnectChainID } from './constants.js'
import { ClientNotInitializedError } from './errors/ClientNotInitializedError.js'
import { WalletConnectFeatureNotSupportedError } from './errors/WalletConnectNotSupportedError.js'
import type {
  UniversalProviderType,
  WalletConnectWalletAdapterConfig,
  WalletConnectWalletInit
} from './types.js'
import { getConnectParams, getDefaultChainFromSession } from './utils.js'

export class WalletConnectWallet {
  private _UniversalProvider: UniversalProviderType | undefined
  private _session: SessionTypes.Struct | undefined
  private _modal: AppKit | undefined
  private _projectId: string
  private _network: WalletConnectChainID
  private _ConnectQueueResolver: ((value: unknown) => void) | undefined

  constructor(config: WalletConnectWalletAdapterConfig) {
    this.initClient(config.options)
    this._network = config.network

    if (!config.options.projectId) {
      throw Error('WalletConnect Adapter: Project ID is undefined')
    }
    this._projectId = config.options.projectId
  }

  async connect(): Promise<WalletConnectWalletInit> {
    if (!this._UniversalProvider) {
      await new Promise(res => {
        this._ConnectQueueResolver = res
      })
    }
    if (!this._UniversalProvider) {
      throw new Error(
        "WalletConnect Adapter - Universal Provider was undefined while calling 'connect()'"
      )
    }

    if (this._UniversalProvider.session) {
      this._session = this._UniversalProvider.session
      const defaultNetwork = getDefaultChainFromSession(
        this._session,
        this._network
      ) as WalletConnectChainID
      this._network = defaultNetwork
      this._UniversalProvider.setDefaultChain(defaultNetwork)

      return {
        publicKey: this.publicKey
      }
    }
    await this.initModal()
    const params = getConnectParams(this._network)
    this._modal?.open()
    const session = await this._UniversalProvider?.connect(params)
    this._modal?.close()
    this._session = session
    if (!session) {
      throw new WalletConnectionError()
    }
    const defaultNetwork = getDefaultChainFromSession(
      session,
      this._network
    ) as WalletConnectChainID
    this._network = defaultNetwork
    this._UniversalProvider?.setDefaultChain(defaultNetwork)

    return { publicKey: this.publicKey }
  }

  async disconnect() {
    if (this._UniversalProvider?.session) {
      await this.initModal()
      if (!this._modal) {
        throw Error('WalletConnect Adapter -Modal is undefined: unable to disconnect')
      }
      await this._modal.disconnect()
      this._session = undefined
    }

    throw new ClientNotInitializedError()
  }

  get client(): UniversalProviderType {
    if (this._UniversalProvider) {
      return this._UniversalProvider
    }
    throw new ClientNotInitializedError()
  }

  get session(): SessionTypes.Struct {
    if (!this._session) {
      throw new ClientNotInitializedError()
    }

    return this._session
  }

  get publicKey(): PublicKey {
    if (this._UniversalProvider?.session && this._session) {
      const { address } = parseAccountId(this._session?.namespaces['solana']?.accounts[0] ?? '')

      return new PublicKey(address)
    }
    throw new ClientNotInitializedError()
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    this.checkIfWalletSupportsMethod(WalletConnectRPCMethods.signTransaction)

    const isVersioned = isVersionedTransaction(transaction)

    const legacyTransaction = isVersioned ? {} : transaction

    const { signature, transaction: signedSerializedTransaction } =
      await this.client.client.request<{
        signature: string
        transaction?: string
      }>({
        chainId: this._network,
        topic: this.session.topic,
        request: {
          method: WalletConnectRPCMethods.signTransaction,
          params: {
            /*
             * Passing ...legacyTransaction is deprecated.
             * All new clients should rely on the `transaction` parameter.
             * The future versions will stop passing ...legacyTransaction.
             */
            ...legacyTransaction,
            // New base64-encoded serialized transaction request parameter
            transaction: this.serialize(transaction)
          }
        }
      })

    if (signedSerializedTransaction) {
      return this.deserialize(signedSerializedTransaction, isVersioned) as T
    }

    transaction.addSignature(this.publicKey, Buffer.from(base58.decode(signature)))

    return transaction
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    this.checkIfWalletSupportsMethod(WalletConnectRPCMethods.signMessage)

    const { signature } = await this.client.client.request<{
      signature: string
    }>({
      // The network does not change the output of message signing, but this is a required parameter for SignClient
      chainId: this._network,
      topic: this.session.topic,
      request: {
        method: WalletConnectRPCMethods.signMessage,
        params: {
          pubkey: this.publicKey.toString(),
          message: base58.encode(message)
        }
      }
    })

    return base58.decode(signature)
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<string> {
    this.checkIfWalletSupportsMethod(WalletConnectRPCMethods.signAndSendTransaction)

    const { signature } = await this.client.client.request<{
      signature: string
    }>({
      chainId: this._network,
      topic: this.session.topic,
      request: {
        method: WalletConnectRPCMethods.signAndSendTransaction,
        params: { transaction: this.serialize(transaction) }
      }
    })

    return signature
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    try {
      this.checkIfWalletSupportsMethod(WalletConnectRPCMethods.signAllTransactions)

      const serializedTransactions = transactions.map(transaction => this.serialize(transaction))

      const { transactions: serializedSignedTransactions } = await this.client.client.request<{
        transactions: string[]
      }>({
        chainId: this._network,
        topic: this.session.topic,
        request: {
          method: WalletConnectRPCMethods.signAllTransactions,
          params: { transactions: serializedTransactions }
        }
      })

      return transactions.map((transaction, index) => {
        if (isVersionedTransaction(transaction)) {
          return this.deserialize(serializedSignedTransactions[index] ?? '', true)
        }

        return this.deserialize(serializedSignedTransactions[index] ?? '')
      }) as T[]
    } catch (error) {
      if (error instanceof WalletConnectFeatureNotSupportedError) {
        const promises = transactions.map(transaction => this.signTransaction(transaction))
        const signedTransactions = await Promise.all(promises)

        return signedTransactions
      }

      throw error
    }
  }

  async initClient(options: SignClientTypes.Options) {
    const provider = await UniversalProvider.init(options)
    this._UniversalProvider = provider
    if (this._ConnectQueueResolver) {
      this._ConnectQueueResolver(true)
    }
  }

  async initModal() {
    if (this._modal) {
      return
    }
    if (!this._UniversalProvider) {
      throw new Error(
        'WalletConnect Adapter - cannot init modal when Universal Provider is undefined'
      )
    }

    const { createAppKit } = await import('@reown/appkit/core')

    this._modal = createAppKit({
      projectId: this._projectId,
      universalProvider: this._UniversalProvider,
      networks: [solana, solanaDevnet, solanaTestnet],
      manualWCControl: true
    })
  }

  private serialize(transaction: Transaction | VersionedTransaction): string {
    return Buffer.from(transaction.serialize({ verifySignatures: false })).toString('base64')
  }

  private deserialize(
    serializedTransaction: string,
    versioned = false
  ): Transaction | VersionedTransaction {
    if (versioned) {
      return VersionedTransaction.deserialize(Buffer.from(serializedTransaction, 'base64'))
    }

    return Transaction.from(Buffer.from(serializedTransaction, 'base64'))
  }

  private checkIfWalletSupportsMethod(method: WalletConnectRPCMethods) {
    if (!this.session.namespaces['solana']?.methods.includes(method)) {
      throw new WalletConnectFeatureNotSupportedError(method)
    }
  }
}
