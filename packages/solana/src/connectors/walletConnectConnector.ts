import base58 from 'bs58'
import { Connection, Transaction, VersionedTransaction, type SendOptions } from '@solana/web3.js'
import { OptionsController, type AccountControllerState } from '@web3modal/core'

import { SolStoreUtil } from '../utils/scaffold/index.js'
import { UniversalProviderFactory } from './universalProvider.js'
import { BaseConnector } from './baseConnector.js'
import type { Connector } from './baseConnector.js'

import type UniversalProvider from '@walletconnect/universal-provider'

import type { Chain, AnyTransaction } from '../utils/scaffold/SolanaTypesUtil.js'
import {
  getChainsFromChainId,
  getDefaultChainFromSession,
  type ChainIDType
} from '../utils/chainPath/index.js'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'

export interface WalletConnectAppMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

export class WalletConnectConnector extends BaseConnector implements Connector {
  id = 'WalletConnect'
  name = 'WalletConnect'
  ready = true
  chains: Chain[]

  protected provider: UniversalProvider | undefined
  protected qrcode: boolean
  setBalance: (balance: AccountControllerState["balance"], balanceSymbol: AccountControllerState["balanceSymbol"]) => void

  public constructor({
    relayerRegion,
    metadata,
    qrcode,
    chains,
    setBalance
  }: {
    relayerRegion: string
    metadata: WalletConnectAppMetadata
    qrcode?: boolean
    chains: Chain[]
    setBalance: (balance: AccountControllerState["balance"], balanceSymbol: AccountControllerState["balanceSymbol"]) => void
  }) {
    super()
    this.chains = chains
    this.qrcode = Boolean(qrcode)
    this.setBalance = setBalance
    UniversalProviderFactory.setSettings({
      projectId: OptionsController.state.projectId,
      relayerRegion,
      metadata,
      qrcode: this.qrcode
    })

    UniversalProviderFactory.init()
  }

  public static readonly connectorName = 'walletconnect'

  public async disconnect() {
    const provider = await UniversalProviderFactory.getProvider()
    await provider.disconnect()
    SolStoreUtil.setAddress('')
  }

  public override getConnectorName(): string {
    return WalletConnectConnector.connectorName
  }

  public override async getProvider() {
    const provider = await UniversalProviderFactory.getProvider()

    return provider
  }

  public async signMessage(message: Uint8Array) {
    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(message),
      pubkey: this.getPubkey()
    })

    return base58.decode(signedMessage.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.request('solana_signTransaction', {
      transaction: serializedTransaction,
      pubkey: this.getPubkey()
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
      pubkey: this.getPubkey(),
      sendOptions
    })

    const balance = await this.getBalance(SolStoreUtil.state.address ?? '')
    this.setBalance(balance.decimals.toString(), 'SOL')


    return result.signature
  }

  public async sendTransaction(
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendOptions
  ) {
    const signedTransaction = await this.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), options)

    const balance = await this.getBalance(SolStoreUtil.state.address ?? '')
    this.setBalance(balance.decimals.toString(), 'SOL')

    return signature
  }

  /**
   * Connect to user's wallet.
   *
   * If `WalletConnectConnector` was configured with `qrcode = true`, this will
   * open a QRCodeModal, where the user will scan the qrcode and then this
   * function will resolve/return the address of the wallet.
   *
   * If `qrcode = false`, this will return the pairing URI used to generate the
   * QRCode.
   */

  public generateNamespaces(chainId: string) {
    const rpcs = this.chains.reduce<Record<string, string>>((acc, chain) => {
      acc[chain.chainId] = chain.rpcUrl

      return acc
    }, {})
    const rpcMap = {
      [chainId]: rpcs[chainId] ?? ''
    }

    return {
      solana: {
        chains: getChainsFromChainId(`solana:${chainId}` as ChainIDType),
        methods: ['solana_signMessage', 'solana_signTransaction', 'solana_signAndSendTransaction'],
        events: [],
        rpcMap
      }
    }
  }

  public async connect() {
    const currentChainId = SolStoreUtil.state.currentChain?.chainId
    const solanaNamespace = this.generateNamespaces(currentChainId ?? '')

    const provider = await UniversalProviderFactory.getProvider()

    return new Promise<string>((resolve, reject) => {
      provider
        .connect({
          optionalNamespaces: solanaNamespace
        })
        .then(session => {
          if (!session) {
            throw new Error('Failed connection.')
          }
          const address = session.namespaces['solana']?.accounts[0]?.split(':')[2] ?? null
          if (address && this.qrcode) {
            const defaultChain = getDefaultChainFromSession(
              session,
              `solana:${currentChainId}` as ChainIDType
            )
            provider.setDefaultChain(defaultChain)

            resolve(address)
          } else {
            reject(new Error('Could not resolve address'))
          }
        })
    })
  }

  public async onConnector() {
    await this.connect()
  }

  private serializeTransaction(transaction: AnyTransaction) {
    return base58.encode(transaction.serialize({ verifySignatures: false }))
  }

  private getPubkey() {
    const address = SolStoreUtil.state.address
    if (!address) {
      throw new Error('No signer connected')
    }

    return address
  }
}
