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
import { registerWallet } from '@wallet-standard/wallet'
import type UniversalProvider from '@walletconnect/universal-provider'
import bs58 from 'bs58'

import { type CaipAddress, type CaipNetworkId, ParseUtil } from '@reown/appkit-common'
import { RouterController } from '@reown/appkit-controllers'

import { createNamespaces } from '../WCNamespaceUtil.js'
import { SolConstantsUtil } from '../solana/SolanaConstantsUtil.js'
import type { AnyTransaction } from '../solana/SolanaTypesUtil.js'
import { type SolanaChain, WalletConnectAccount } from './WalletConnectAccount.js'
import { SOLANA_CHAINS } from './constants.js'
import { isSolanaChain, isVersionedTransaction } from './utils.js'

function caipNetworkToStandardChain(caipNetworkId: CaipNetworkId) {
  const map: Record<CaipNetworkId, `solana:${string}`> = {
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'solana:mainnet',
    'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ': 'solana:mainnet',

    'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'solana:testnet',

    'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K': 'solana:devnet',
    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'solana:devnet'
  }

  return map[caipNetworkId]
}

export class SolanaWalletConnectStandardWallet implements Wallet {
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = {}
  readonly #version = '1.0.0' as const
  #provider: UniversalProvider
  #name = 'WalletConnect'
  #icon =
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+'
  #account: WalletConnectAccount | null = null

  static register(provider: UniversalProvider) {
    const instance = new SolanaWalletConnectStandardWallet(provider)
    registerWallet(instance)
  }

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

  /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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
    const solanaNamespace = this.#provider.session?.namespaces?.['solana']
    const standardChains = solanaNamespace?.chains?.map(chain =>
      caipNetworkToStandardChain(chain as CaipNetworkId)
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

  private constructor(provider: UniversalProvider) {
    this.#provider = provider
    this.setProvider(provider)
    registerWallet(this)
  }

  setProvider(provider: UniversalProvider) {
    this.#provider = provider
    this.#name = 'WalletConnect'

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

    return (): void => this.#off(event, listener)
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
    const account = this.accounts[0]
    const publicKey = account?.publicKey

    if (publicKey) {
      this.#account = new WalletConnectAccount(account)
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
    if (this.#provider.session?.namespaces?.['solana']?.accounts.length) {
      this.#connected()
    } else {
      this.#disconnected()
    }
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.#account) {
      RouterController.push('ConnectingWalletConnect')

      await this.#provider.connect({
        namespaces: createNamespaces([SolConstantsUtil.DEFAULT_CHAIN])
      })
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
      if (account?.address !== this.#account?.address) {
        throw new Error('invalid account')
      }
      if (!isSolanaChain(chain || ':')) {
        throw new Error('invalid chain')
      }

      if (!transaction) {
        throw new Error('invalid transaction')
      }

      const signature = await this.#provider.request<{ signature: string }>({
        method: 'solana_signAndSendTransaction',
        params: {
          transaction,
          pubkey: this.#account.address,
          sendOptions: {
            preflightCommitment,
            minContextSlot,
            maxRetries,
            skipPreflight
          }
        }
      })

      outputs.push({ signature: bs58.decode(signature.signature) })
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
      if (account?.address !== this.#account.address) {
        throw new Error('invalid account')
      }
      if (chain && !isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      if (!transaction) {
        throw new Error('invalid transaction')
      }

      const tx = Transaction.from(transaction)
      let result: AnyTransaction | undefined = undefined

      const signedTransaction = await this.#provider.request<
        { signature: string } | { transaction: string }
      >({
        method: 'solana_signTransaction',
        params: {
          transaction,
          pubkey: this.#account.address
        }
      })

      // If the result contains signature is the old RPC response
      if ('signature' in signedTransaction) {
        const decoded = bs58.decode(signedTransaction.signature)

        tx.addSignature(
          new PublicKey(this.#account.publicKey),
          Buffer.from(decoded) as Buffer & Uint8Array
        )

        result = tx
      } else {
        const decodedTransaction = Buffer.from(signedTransaction.transaction, 'base64')

        if (isVersionedTransaction(tx)) {
          result = VersionedTransaction.deserialize(
            new Uint8Array(decodedTransaction)
          ) as AnyTransaction
        }

        result = Transaction.from(decodedTransaction) as AnyTransaction
      }

      if (!result) {
        throw new Error('invalid transaction')
      }

      const serializedTransaction = isVersionedTransaction(result)
        ? result.serialize()
        : new Uint8Array(
            result.serialize({
              requireAllSignatures: false,
              verifySignatures: false
            })
          )

      outputs.push({ signedTransaction: serializedTransaction })
    } else if (inputs.length > 1) {
      let chain: SolanaChain | undefined = undefined
      for (const input of inputs) {
        if (input.account?.address !== this.#account.address) {
          throw new Error('invalid account')
        }
        if (input.chain) {
          if (!isSolanaChain(input.chain)) {
            throw new Error('invalid chain')
          }
          if (chain && input.chain !== chain) {
            throw new Error('conflicting chain')
          }
          chain = input.chain
        }
      }

      const transactions = inputs.map(({ transaction }) =>
        VersionedTransaction.deserialize(transaction)
      )

      const result = await this.#provider.request<{ transactions: string[] }>({
        method: 'solana_signAllTransactions',
        params: {
          transactions
        }
      })

      const signedTransactions = result.transactions.map((serializedTransaction, index) => {
        const transaction = transactions[index]

        if (!transaction) {
          throw new Error('Invalid transactions response')
        }

        const decodedTransaction = Buffer.from(serializedTransaction, 'base64')

        if (isVersionedTransaction(transaction)) {
          return VersionedTransaction.deserialize(new Uint8Array(decodedTransaction))
        }

        return Transaction.from(decodedTransaction)
      })

      outputs.push(
        ...signedTransactions.map(signedTransaction => {
          const serializedTransaction = isVersionedTransaction(signedTransaction)
            ? signedTransaction.serialize()
            : new Uint8Array(
                signedTransaction.serialize({
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
      if (account?.address !== this.#account.address) {
        throw new Error('invalid account')
      }

      if (!message) {
        throw new Error('invalid message')
      }

      const signature = await this.#provider.request<{ signature: string }>({
        method: 'solana_signMessage',
        params: {
          message,
          pubkey: this.#account.address
        }
      })

      outputs.push({ signedMessage: message, signature: bs58.decode(signature.signature) })
    } else if (inputs.length > 1) {
      const results = await Promise.all(inputs.map(input => this.#signMessage(input)))
      for (const result of results) {
        outputs.push(...result)
      }
    }

    return outputs
  }
}
