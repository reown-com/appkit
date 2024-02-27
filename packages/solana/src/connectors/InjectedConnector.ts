import base58 from 'bs58'
import { SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import type { Connector } from './BaseConnector'
import { BaseConnector } from './BaseConnector'

import type { Transaction, VersionedTransaction } from '@solana/web3.js'

export interface PhantomPublicKey {
  length: number
  negative: number
  words: Uint8Array
  toString: () => string
}

export class InjectedConnector extends BaseConnector implements Connector {
  public injectedWalletPath: string
  public id: string
  public name: string
  ready = true

  public constructor(injectedWallet: string, id: string, name: string) {
    super()
    if (!injectedWallet) {throw new Error('Invalid path provided, should match window..*')}
    const walletPathSplit = injectedWallet.split('.')
    if (walletPathSplit[0] !== 'window')
      {throw new Error('Injected wallet path must start at window')}
    this.injectedWalletPath = injectedWallet
    this.id = id
    this.name = name
  }

  public connectorName(walletName: string) {
    return `injected-${walletName}`
  }

  public override getConnectorName(): string {
    return this.connectorName(this.injectedWalletPath)
  }

  public async disconnect() {
    const provider = await this.getProvider()
    SolStoreUtil.setAddress('')
    provider.disconnect()
  }

  public override async getProvider() {
    const providerPath = this.injectedWalletPath.split('.').slice(1)
    if (typeof window !== 'undefined') {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const injectedWalletProvider = providerPath.reduce<any>((provider, accessor) => {
        if (provider) {return provider[accessor]}

        return null
      }, window)

      if (injectedWalletProvider) {return Promise.resolve(injectedWalletProvider)}
    }

    return Promise.resolve(null)
  }

  public isAvailable(): boolean {
    return Boolean(this.getProvider())
  }

  public async connect() {
    const provider = await this.getProvider()
    const resp = await provider.connect()

    SolStoreUtil.setIsConnected(true)
    if (resp?.publicKey) {
      SolStoreUtil.setAddress(resp.publicKey.toString())

      return resp.publicKey.toString()
    } else if (resp?.publickey) {
      SolStoreUtil.setAddress(resp.publickey.toString())

      return resp.publickey.toString()
    } else if (resp === true) {
      const cProvider = await this.getProvider()
      const publicKey = cProvider.pubkey || cProvider.publicKey
      SolStoreUtil.setAddress(publicKey.toString())

      return publicKey
    }
    if (provider.publicKey.toString().length) {
      const cProvider = await this.getProvider()
      const publicKey = cProvider.pubkey || cProvider.publicKey
      SolStoreUtil.setAddress(publicKey.toString())

      return cProvider.publicKey
    }

    throw new Error('Failed to connect')
  }

  public async signMessage(message: Uint8Array) {
    const signedMessage = await this.request('signMessage', {
      message,
      format: 'utf8'
    })

    if (!signedMessage) {throw new Error(`Failed to sign message using ${this.getConnectorName()}`)}

    const { signature } = signedMessage

    return signature
  }

  public async signTransaction(
    transaction: Transaction | VersionedTransaction
  ) {
    const signedTransaction = await (await this.getProvider()).signTransaction(transaction)

    if (signedTransaction) {

      return { signatures: [{ signature: base58.encode(signedTransaction.signature) }] }
    }

    throw new Error(`Could not sign transaction using ${this.getConnectorName()}`)
  }

  public async sendTransaction(transaction: Transaction | VersionedTransaction) {
    const { signatures } = await this.signTransaction(transaction)
    const encodedTransaction = transaction.serialize().toString('base64')
    await this.requestCluster('sendTransaction', [encodedTransaction])
    
    return signatures[0]?.signature ?? ''
  }

  public async on(...rest: any[]) {
    const provider = await this.getProvider()
    provider.on(...rest)
  }
  public async onConnector() {
    await this.connect()
  }
}
