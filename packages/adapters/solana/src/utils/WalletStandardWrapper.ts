/* eslint-disable max-classes-per-file */
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput
} from '@solana/wallet-standard-features'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import type { Wallet, WalletIcon } from '@wallet-standard/base'
import type { IdentifierString } from '@wallet-standard/base'
import type { WalletAccount } from '@wallet-standard/base'
import type {
  StandardConnectFeature,
  StandardConnectMethod,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod
} from '@wallet-standard/features'
import type UniversalProvider from '@walletconnect/universal-provider'
import bs58 from 'bs58'

import type { Provider } from '@reown/appkit-adapter-solana'
import { type CaipAddress, type CaipNetworkId, ParseUtil } from '@reown/appkit-common'
import { ModalController } from '@reown/appkit-controllers'

import { getStandardChain } from './chains.js'

/** Array of all Solana clusters */
export const SOLANA_CHAINS = [
  'solana:mainnet',
  'solana:devnet',
  'solana:testnet',
  'solana:localnet'
] as const

/** Type of all Solana clusters */
export type SolanaChain = (typeof SOLANA_CHAINS)[number]

/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain)
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
  return 'version' in transaction
}

export class WalletConnectAccount implements WalletAccount {
  readonly #address: WalletAccount['address']
  readonly #publicKey: WalletAccount['publicKey']
  readonly #chains: WalletAccount['chains']
  readonly #features: WalletAccount['features']
  readonly #label: WalletAccount['label']
  readonly #icon: WalletAccount['icon']

  get address() {
    return this.#address
  }

  get publicKey() {
    return this.#publicKey.slice()
  }

  get chains() {
    return this.#chains.slice()
  }

  get features() {
    return this.#features.slice()
  }

  get label() {
    return this.#label
  }

  get icon() {
    return this.#icon
  }

  constructor({ address, publicKey, label, icon }: Omit<WalletAccount, 'chains' | 'features'>) {
    this.#address = address
    this.#publicKey = publicKey
    this.#chains = SOLANA_CHAINS
    this.#features = [
      'solana:signAndSendTransaction',
      'solana:signTransaction',
      'solana:signMessage'
    ]
    this.#label = label
    this.#icon = icon
  }
}

export class WalletConnectStandardWrapper implements Wallet {
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  readonly #version = '1.0.0' as const
  #provider: Provider
  #name = 'WalletConnect'
  #icon =
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+'
  #account: WalletAccount | null = null

  get version() {
    return this.#version
  }

  get name() {
    return this.#name
  }

  get icon() {
    return this.#icon as WalletIcon
  }

  get chains() {
    return SOLANA_CHAINS.slice()
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.#connect
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: this.#disconnect
      },
      'standard:events': {
        version: '1.0.0',
        on: this.#on
      },
      'solana:signAndSendTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction
      },
      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction
      },
      'solana:signMessage': {
        version: '1.0.0',
        signMessage: this.#signMessage
      }
    }
  }

  get accounts() {
    const solanaNamespace = (this.#provider.provider as UniversalProvider).session?.namespaces?.[
      'solana'
    ]
    console.log('>> #accounts', solanaNamespace?.accounts)

    const standardChains = solanaNamespace?.chains?.map(chain =>
      getStandardChain(chain as CaipNetworkId)
    )

    return (
      solanaNamespace?.accounts.map(account => {
        const { address } = ParseUtil.parseCaipAddress(account as CaipAddress)
        const publicKey = new PublicKey(bs58.decode(address))

        return {
          address,
          publicKey: publicKey.toBytes(),
          chains: standardChains as CaipNetworkId[],
          features: [
            'solana:signAndSendTransaction',
            'solana:signTransaction',
            'solana:signMessage'
          ] as const
        }
      }) || []
    )
  }

  constructor(provider: Provider) {
    this.#provider = provider
    this.setProvider(provider)
  }

  setProvider(provider: Provider) {
    this.#provider = provider
    this.#name = provider.name

    provider.on('connect', () => this.#connected())
    provider.on('disconnect', () => this.#disconnected())
    provider.on('accountsChanged', () => this.#reconnected())
    provider.on('chainChanged', () => this.#reconnected())

    this.#connected()
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    if (!this.#listeners[event]) {
      this.#listeners[event] = []
    }
    this.#listeners[event].push(listener)

    return () => this.#off(event, listener)
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach(listener => listener.apply(null, args))
  }

  #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
    this.#listeners[event] = this.#listeners[event]?.filter(
      existingListener => listener !== existingListener
    )
  }

  #connected = () => {
    const publicKey = this.#provider.publicKey

    if (publicKey) {
      this.#account = new WalletConnectAccount({
        address: publicKey.toBase58(),
        publicKey: publicKey.toBytes()
      })
      this.#emit('change', { accounts: this.accounts })
    }
  }

  #disconnected = () => {
    if (this.#account) {
      this.#account = null
      this.#emit('change', { accounts: this.accounts })
    }
  }

  #reconnected = () => {
    if (this.#provider.publicKey) {
      this.#connected()
    } else {
      this.#disconnected()
    }
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.#account) {
      if (!ModalController.state.open) {
        ModalController.open({
          view: 'ConnectingWalletConnect',
          namespace: 'solana'
        })
      }
      await this.#provider.connect()
    }

    this.#connected()

    return { accounts: this.accounts }
  }

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#provider.disconnect()
  }

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignAndSendTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0] || {}
      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } = options || {}
      if (account !== this.#account) {
        throw new Error('invalid account')
      }
      if (!chain || !isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      if (!transaction) {
        throw new Error('transaction is required')
      }

      const signature = await this.#provider.signAndSendTransaction(
        VersionedTransaction.deserialize(transaction),
        {
          preflightCommitment,
          minContextSlot,
          maxRetries,
          skipPreflight
        }
      )

      outputs.push({ signature: bs58.decode(signature) })
    } else if (inputs.length > 1) {
      const results = await Promise.all(inputs.map(input => this.#signAndSendTransaction(input)))
      for (const result of results) {
        outputs.push(...result)
      }
    }

    return outputs
  }

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0] || {}
      if (account !== this.#account) {
        throw new Error('invalid account')
      }
      if (chain && !isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      if (!transaction) {
        throw new Error('transaction is required')
      }

      const signedTransaction = await this.#provider.signTransaction(
        VersionedTransaction.deserialize(transaction)
      )

      const serializedTransaction = isVersionedTransaction(signedTransaction)
        ? signedTransaction.serialize()
        : new Uint8Array(
            (signedTransaction as Transaction).serialize({
              requireAllSignatures: false,
              verifySignatures: false
            })
          )

      outputs.push({ signedTransaction: serializedTransaction })
    } else if (inputs.length > 1) {
      let chain: SolanaChain | undefined = undefined
      for (const input of inputs) {
        if (input.account !== this.#account) {
          throw new Error('invalid account')
        }
        if (input.chain) {
          if (!isSolanaChain(input.chain)) {
            throw new Error('invalid chain')
          }
          if (chain && input.chain !== chain) {
            throw new Error('conflicting chain')
          }
          chain ||= input.chain
        }
      }

      const transactions = inputs.map(({ transaction }) =>
        VersionedTransaction.deserialize(transaction)
      )

      const signedTransactions = await this.#provider.signAllTransactions(transactions)

      outputs.push(
        ...signedTransactions.map(signedTransaction => {
          const serializedTransaction = isVersionedTransaction(signedTransaction)
            ? signedTransaction.serialize()
            : new Uint8Array(
                (signedTransaction as Transaction).serialize({
                  requireAllSignatures: false,
                  verifySignatures: false
                })
              )

          return { signedTransaction: serializedTransaction }
        })
      )
    }

    return outputs
  }

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignMessageOutput[] = []

    if (inputs.length === 1) {
      const { message, account } = inputs[0] || {}
      if (account !== this.#account) {
        throw new Error('invalid account')
      }

      if (!message) {
        throw new Error('message is required')
      }

      const signature = await this.#provider.signMessage(message)

      outputs.push({ signedMessage: message, signature })
    } else if (inputs.length > 1) {
      const results = await Promise.all(inputs.map(input => this.#signMessage(input)))
      for (const result of results) {
        outputs.push(...result)
      }
    }

    return outputs
  }
}
