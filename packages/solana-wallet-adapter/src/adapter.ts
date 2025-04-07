import type { WalletError, WalletName } from '@solana/wallet-adapter-base'
import {
  BaseSignerWalletAdapter,
  WalletAdapterNetwork,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
  WalletWindowClosedError
} from '@solana/wallet-adapter-base'
import type {
  PublicKey,
  Transaction,
  TransactionVersion,
  VersionedTransaction
} from '@solana/web3.js'

import { WalletConnectChainID } from './constants.js'
import { WalletConnectWallet } from './core.js'
import type { WalletConnectWalletAdapterConfig as BaseWalletConnectWalletAdapterConfig } from './types.js'

export const WalletConnectWalletName = 'WalletConnect' as WalletName<'WalletConnect'>

export type WalletConnectWalletAdapterConfig = {
  network: WalletAdapterNetwork.Mainnet | WalletAdapterNetwork.Devnet
} & Pick<BaseWalletConnectWalletAdapterConfig, 'options'>

export class WalletConnectWalletAdapter extends BaseSignerWalletAdapter {
  name = WalletConnectWalletName
  url = 'https://walletconnect.org'
  icon =
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYxLjQzODU0MjkgMzYuMjU2MjYxMmM0OC45MTEyMjQxLTQ3Ljg4ODE2NjMgMTI4LjIxMTk4NzEtNDcuODg4MTY2MyAxNzcuMTIzMjA5MSAwbDUuODg2NTQ1IDUuNzYzNDE3NGMyLjQ0NTU2MSAyLjM5NDQwODEgMi40NDU1NjEgNi4yNzY1MTEyIDAgOC42NzA5MjA0bC0yMC4xMzY2OTUgMTkuNzE1NTAzYy0xLjIyMjc4MSAxLjE5NzIwNTEtMy4yMDUzIDEuMTk3MjA1MS00LjQyODA4MSAwbC04LjEwMDU4NC03LjkzMTE0NzljLTM0LjEyMTY5Mi0zMy40MDc5ODE3LTg5LjQ0Mzg4Ni0zMy40MDc5ODE3LTEyMy41NjU1Nzg4IDBsLTguNjc1MDU2MiA4LjQ5MzYwNTFjLTEuMjIyNzgxNiAxLjE5NzIwNDEtMy4yMDUzMDEgMS4xOTcyMDQxLTQuNDI4MDgwNiAwbC0yMC4xMzY2OTQ5LTE5LjcxNTUwMzFjLTIuNDQ1NTYxMi0yLjM5NDQwOTItMi40NDU1NjEyLTYuMjc2NTEyMiAwLTguNjcwOTIwNHptMjE4Ljc2Nzc5NjEgNDAuNzczNzQ0OSAxNy45MjE2OTcgMTcuNTQ2ODk3YzIuNDQ1NTQ5IDIuMzk0Mzk2OSAyLjQ0NTU2MyA2LjI3NjQ3NjkuMDAwMDMxIDguNjcwODg5OWwtODAuODEwMTcxIDc5LjEyMTEzNGMtMi40NDU1NDQgMi4zOTQ0MjYtNi40MTA1ODIgMi4zOTQ0NTMtOC44NTYxNi4wMDAwNjItLjAwMDAxLS4wMDAwMS0uMDAwMDIyLS4wMDAwMjItLjAwMDAzMi0uMDAwMDMybC01Ny4zNTQxNDMtNTYuMTU0NTcyYy0uNjExMzktLjU5ODYwMi0xLjYwMjY1LS41OTg2MDItMi4yMTQwNCAwLS4wMDAwMDQuMDAwMDA0LS4wMDAwMDcuMDAwMDA4LS4wMDAwMTEuMDAwMDExbC01Ny4zNTI5MjEyIDU2LjE1NDUzMWMtMi40NDU1MzY4IDIuMzk0NDMyLTYuNDEwNTc1NSAyLjM5NDQ3Mi04Ljg1NjE2MTIuMDAwMDg3LS4wMDAwMTQzLS4wMDAwMTQtLjAwMDAyOTYtLjAwMDAyOC0uMDAwMDQ0OS0uMDAwMDQ0bC04MC44MTI0MTk0My03OS4xMjIxODVjLTIuNDQ1NTYwMjEtMi4zOTQ0MDgtMi40NDU1NjAyMS02LjI3NjUxMTUgMC04LjY3MDkxOTdsMTcuOTIxNzI5NjMtMTcuNTQ2ODY3M2MyLjQ0NTU2MDItMi4zOTQ0MDgyIDYuNDEwNTk4OS0yLjM5NDQwODIgOC44NTYxNjAyIDBsNTcuMzU0OTc3NSA1Ni4xNTUzNTdjLjYxMTM5MDguNTk4NjAyIDEuNjAyNjQ5LjU5ODYwMiAyLjIxNDAzOTggMCAuMDAwMDA5Mi0uMDAwMDA5LjAwMDAxNzQtLjAwMDAxNy4wMDAwMjY1LS4wMDAwMjRsNTcuMzUyMTAzMS01Ni4xNTUzMzNjMi40NDU1MDUtMi4zOTQ0NjMzIDYuNDEwNTQ0LTIuMzk0NTUzMSA4Ljg1NjE2MS0uMDAwMi4wMDAwMzQuMDAwMDMzNi4wMDAwNjguMDAwMDY3My4wMDAxMDEuMDAwMTAxbDU3LjM1NDkwMiA1Ni4xNTU0MzJjLjYxMTM5LjU5ODYwMSAxLjYwMjY1LjU5ODYwMSAyLjIxNDA0IDBsNTcuMzUzOTc1LTU2LjE1NDMyNDljMi40NDU1NjEtMi4zOTQ0MDkyIDYuNDEwNTk5LTIuMzk0NDA5MiA4Ljg1NjE2IDB6IiBmaWxsPSIjM2I5OWZjIi8+PC9zdmc+'
  /*
   * V0 transactions are supported via the `transaction` parameter, and is off-spec.
   * Legacy transactions have these [parameters](https://docs.walletconnect.com/2.0/advanced/rpc-reference/solana-rpc#solana_signtransaction)
   */
  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0])

  private _publicKey: PublicKey | null
  private _connecting: boolean
  private _wallet: WalletConnectWallet | null
  private _config: WalletConnectWalletAdapterConfig
  private _readyState: WalletReadyState

  private _onDisconnect: WalletConnectWalletAdapter['disconnect'] | undefined

  constructor(config: WalletConnectWalletAdapterConfig) {
    super()

    this._publicKey = null
    this._connecting = false
    this._config = config
    this._wallet = null
    this._readyState =
      typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable

    this._onDisconnect = this.disconnect.bind(this)
  }

  get publicKey() {
    return this._publicKey
  }

  get connecting() {
    return this._connecting
  }

  get readyState() {
    return this._readyState
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) {
        return
      }
      if (this._readyState !== WalletReadyState.Loadable) {
        throw new WalletNotReadyError()
      }

      this._connecting = true
      this._wallet = new WalletConnectWallet({
        network:
          this._config.network === WalletAdapterNetwork.Mainnet
            ? WalletConnectChainID.Mainnet
            : WalletConnectChainID.Devnet,
        options: this._config.options
      })
      const { publicKey } = await this._wallet.connect()
      this._publicKey = publicKey
      this.emit('connect', publicKey)
      this._wallet.client.on('session_delete', this._onDisconnect)
    } catch (error: unknown) {
      if ((error as Error).constructor.name === 'QRCodeModalError') {
        throw new WalletWindowClosedError()
      }
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet
    if (wallet) {
      wallet.client.off('session_delete', this._onDisconnect)
      this._publicKey = null

      try {
        if (wallet.client.session) {
          await wallet.disconnect()
        }
      } catch (error: unknown) {
        this.emit('error', new WalletDisconnectionError((error as Error)?.message, error))
      }
    }

    this.emit('disconnect')
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return await wallet.signTransaction(transaction)
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error)
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return await wallet.signMessage(message)
      } catch (error: unknown) {
        throw new WalletSignMessageError((error as Error)?.message, error)
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError)
      throw error
    }
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<string> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return await wallet.signAndSendTransaction(transaction)
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error)
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError)
      throw error
    }
  }

  override async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return await wallet.signAllTransactions(transactions)
      } catch (error: unknown) {
        throw new WalletSignTransactionError((error as Error)?.message, error)
      }
    } catch (error: unknown) {
      this.emit('error', error as WalletError)
      throw error
    }
  }
}
