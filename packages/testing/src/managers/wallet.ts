import { Keypair } from '@solana/web3.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import bs58 from 'bs58'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import nacl from 'tweetnacl'
import { createWalletClient, http } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

import type { ChainNamespace } from '@reown/appkit-common'

bitcoin.initEccLib(ecc)

// -- Types -------------------------------------------- //
interface WalletManagerOptions {
  namespaces: ChainNamespace[]
}

interface Account {
  address: string
}

interface Connection {
  accounts: Account[]
  signMessage: (message: string) => Promise<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTypedData: (data: any) => Promise<string>
}

// -- Utils & Others ---------------------------------------- //
function toBitcoinAddress(pair: ReturnType<typeof ECPair.makeRandom>): string {
  const address = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(pair.publicKey) })?.address

  return address ?? ''
}

// eslint-disable-next-line new-cap
const ECPair = ECPairFactory(ecc)

export class WalletManager {
  private connections = new Map<ChainNamespace, Connection>()

  constructor({ namespaces }: WalletManagerOptions) {
    for (const namespace of namespaces) {
      switch (namespace) {
        case 'eip155': {
          const acc = privateKeyToAccount(generatePrivateKey())
          const secondAcc = privateKeyToAccount(generatePrivateKey())
          const wallet = createWalletClient({
            account: acc,
            chain: sepolia,
            transport: http()
          })

          this.connections.set(namespace, {
            accounts: [{ address: acc.address }, { address: secondAcc.address }],
            signMessage: async message => wallet.signMessage({ message }),
            signTypedData: async data => wallet.signTypedData(data)
          })
          break
        }

        case 'solana': {
          const acc = Keypair.generate()
          const secondAcc = Keypair.generate()

          this.connections.set(namespace, {
            accounts: [
              { address: acc.publicKey.toBase58() },
              { address: secondAcc.publicKey.toBase58() }
            ],
            signMessage: message => {
              const messageBytes = new TextEncoder().encode(message)
              const signature = nacl.sign.detached(messageBytes, acc.secretKey)
              const signatureBase58 = bs58.encode(Buffer.from(signature))

              return Promise.resolve(signatureBase58)
            },
            signTypedData: () => {
              throw new Error('signTypedData not supported for bip122')
            }
          })
          break
        }

        case 'bip122': {
          const acc = ECPair.makeRandom()
          const secondAcc = ECPair.makeRandom()

          this.connections.set(namespace, {
            accounts: [
              { address: toBitcoinAddress(acc) },
              { address: toBitcoinAddress(secondAcc) }
            ],
            signMessage: message => {
              const keyPair = ECPair.fromPrivateKey(acc.privateKey as Uint8Array)
              const pKey = keyPair.privateKey as Uint8Array
              const messageBuffer = new TextEncoder().encode(message)

              const signature = bitcoinMessage.sign(
                messageBuffer as Buffer,
                Buffer.from(pKey),
                keyPair.compressed,
                {
                  segwitType: 'p2wpkh'
                }
              )

              return Promise.resolve(bs58.encode(Buffer.from(signature)))
            },
            signTypedData: () => {
              throw new Error('signTypedData not supported for bip122')
            }
          })
          break
        }

        default:
          throw new Error(`Unsupported namespace: ${namespace}`)
      }
    }
  }

  getAddress(namespace: ChainNamespace): string {
    const connection = this.connections.get(namespace)

    if (!connection) {
      throw new Error(`No connection for ${namespace}`)
    }

    return connection.accounts[0]?.address ?? ''
  }

  getAccounts(namespace: ChainNamespace, displayFirstOnly = true) {
    const connection = this.connections.get(namespace)

    if (!connection) {
      throw new Error(`No connection for ${namespace}`)
    }

    return displayFirstOnly
      ? [connection.accounts[0]?.address ?? '']
      : connection.accounts.map(a => a.address)
  }

  async signMessage(message: string, namespace: ChainNamespace) {
    const connection = this.connections.get(namespace)

    if (!connection) {
      throw new Error(`No connection for ${namespace}`)
    }

    return connection.signMessage(message)
  }

  async signTypedData(typedData: string, namespace: ChainNamespace) {
    const connection = this.connections.get(namespace)

    if (!connection) {
      throw new Error(`No connection for ${namespace}`)
    }

    return connection.signTypedData(JSON.parse(typedData))
  }
}
