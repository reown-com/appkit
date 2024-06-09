import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  Connector,
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil.js'
import { TransactionsController } from './TransactionsController.js'
import { ChainController, type Chain } from './ChainController.js'

// -- Types --------------------------------------------- //
export interface ConnectExternalOptions {
  id: Connector['id']
  type: Connector['type']
  provider?: Connector['provider']
  info?: Connector['info']
}

export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: string) => Promise<string>
  sendTransaction: (args: SendTransactionArgs) => Promise<`0x${string}` | null>
  estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>
  parseUnits: (value: string, decimals: number) => bigint
  formatUnits: (value: bigint, decimals: number) => string
  connectExternal?: (options: ConnectExternalOptions) => Promise<void>
  reconnectExternal?: (options: ConnectExternalOptions) => Promise<void>
  checkInstalled?: (ids?: string[]) => boolean
  writeContract: (args: WriteContractArgs) => Promise<`0x${string}` | null>
  getEnsAddress: (value: string) => Promise<false | string>
  getEnsAvatar: (value: string) => Promise<false | string>
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient
  wcUri?: string
  wcPromise?: Promise<void>
  wcPairingExpiry?: number
  wcLinking?: {
    href: string
    name: string
  }
  wcError?: boolean
  recentWallet?: WcWallet
  buffering: boolean
}

type StateKey = keyof ConnectionControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({
  wcError: false,
  buffering: false
})

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ConnectionControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  _getClient(chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      if (!chain) {
        throw new Error('ConnectionController chain not set')
      }

      const client = ChainController.getConnectionControllerClient(
        chain
      ) as ConnectionControllerClient
      return client
    }

    if (!state._client) {
      throw new Error('ConnectionController client not set')
    }

    return state._client as ConnectionControllerClient
  },

  setClient(client: ConnectionControllerClient) {
    state._client = ref(client)
  },

  connectWalletConnect(chain?: Chain) {
    state.wcPromise = this._getClient(chain).connectWalletConnect(uri => {
      state.wcUri = uri
      state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry()
    })
    StorageUtil.setConnectedConnector('WALLET_CONNECT')
  },

  async connectExternal(options: ConnectExternalOptions, chain?: Chain) {
    await this._getClient(chain).connectExternal?.(options)
    ChainController.setActiveChain(chain)
    StorageUtil.setConnectedConnector(options.type)
  },

  async reconnectExternal(options: ConnectExternalOptions, chain?: Chain) {
    await this._getClient(chain).reconnectExternal?.(options)
    StorageUtil.setConnectedConnector(options.type)
  },

  async signMessage(message: string, chain?: Chain) {
    return this._getClient(chain).signMessage(message)
  },

  parseUnits(value: string, decimals: number, chain?: Chain) {
    return this._getClient(chain).parseUnits(value, decimals)
  },

  formatUnits(value: bigint, decimals: number, chain?: Chain) {
    return this._getClient(chain).formatUnits(value, decimals)
  },

  async sendTransaction(args: SendTransactionArgs, chain?: Chain) {
    return this._getClient(chain).sendTransaction(args)
  },

  async estimateGas(args: EstimateGasTransactionArgs, chain?: Chain) {
    return this._getClient(chain).estimateGas(args)
  },

  async writeContract(args: WriteContractArgs, chain?: Chain) {
    return this._getClient(chain).writeContract(args)
  },

  async getEnsAddress(value: string, chain?: Chain) {
    return this._getClient(chain).getEnsAddress(value)
  },

  async getEnsAvatar(value: string, chain?: Chain) {
    return this._getClient(chain).getEnsAvatar(value)
  },

  checkInstalled(ids?: string[], chain?: Chain) {
    return this._getClient(chain).checkInstalled?.(ids) || false
  },

  resetWcConnection() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    state.wcPromise = undefined
    state.wcLinking = undefined
    state.recentWallet = undefined
    TransactionsController.resetTransactions()
    StorageUtil.deleteWalletConnectDeepLink()
  },

  setWcLinking(wcLinking: ConnectionControllerState['wcLinking']) {
    state.wcLinking = wcLinking
  },

  setWcError(wcError: ConnectionControllerState['wcError']) {
    state.wcError = wcError
    state.buffering = false
  },

  setRecentWallet(wallet: ConnectionControllerState['recentWallet']) {
    state.recentWallet = wallet
  },

  setBuffering(buffering: ConnectionControllerState['buffering']) {
    state.buffering = buffering
  },

  async disconnect() {
    const chain = ChainController.state.activeChain
    const client = this._getClient(chain)
    try {
      await client.disconnect()
      StorageUtil.removeConnectedWalletImageUrl()
    } catch (error) {
      throw new Error('Failed to disconnect')
    }
  }
}
