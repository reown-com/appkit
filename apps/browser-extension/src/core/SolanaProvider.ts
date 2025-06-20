/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SOLANA_CHAINS } from '@solana/wallet-standard'
import { Keypair, PublicKey } from '@solana/web3.js'
import { WalletAccount } from '@wallet-standard/core'
import nacl from 'tweetnacl'

import { AccountUtil } from '../utils/AccountUtil'
import { ConstantsUtil } from '../utils/ConstantsUtil'

const keypair = Keypair.fromSecretKey(AccountUtil.privateKeySolana)
const publicKey = keypair.publicKey

export class SolanaProvider {
  name = 'Reown'
  version = '1.0.0' as const
  icon = ConstantsUtil.IconRaw as `data:image/png;base64,${string}`
  chains = SOLANA_CHAINS
  accounts: WalletAccount[] = [
    {
      address: publicKey.toBase58(),
      // @ts-expect-error
      publicKey,
      chains: SOLANA_CHAINS,
      features: [
        'standard:connect',
        'standard:events',
        'solana:signAndSendTransaction',
        'solana:signTransaction',
        'solana:signMessage'
      ]
    }
  ]
  publicKey = new PublicKey(publicKey.toBase58())
  isConnected = false

  public get features() {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.connect
      },
      'standard:events': {
        version: '1.0.0',
        on: () => {}
      },
      'solana:signAndSendTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy'],
        signAndSendTransaction: this.signAndSendTransaction
      },
      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy'],
        signTransaction: this.signTransaction
      },
      'solana:signMessage': {
        version: '1.0.0',
        signMessage: this.signMessage
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect
      }
    }
  }

  connect() {
    return Promise.resolve(publicKey.toBase58())
  }

  disconnect() {
    return Promise.resolve()
  }

  handleNotification() {
    return Promise.resolve()
  }

  removeAllListeners() {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
  request({ method, params }: { method: string; params: any }) {}

  signAllTransactions(transactions = []) {
    return Promise.resolve()
  }

  signAndSendAllTransactions(transactions = [], options = {}) {
    return Promise.resolve()
  }

  signAndSendTransaction(transaction = [], options = {}) {
    return Promise.resolve()
  }

  signIn() {
    return Promise.resolve()
  }

  signMessage({ message }: { message: Uint8Array }) {
    const messageBytes = Uint8Array.from(Object.values(message))
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
    const isValid = nacl.sign.detached.verify(messageBytes, signature, keypair.publicKey.toBytes())

    if (!isValid) {
      throw new Error('Invalid signature')
    }

    return [{ signature }]
  }

  sendTransaction(message: string, encoding = 'utf8') {
    return Promise.resolve()
  }

  signTransaction(transaction = []) {
    return Promise.resolve()
  }
}
