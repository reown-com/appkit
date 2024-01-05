import type { W3mFrameProvider } from '@web3modal/wallet'
import type { CaipNetwork } from '@web3modal/scaffold'

import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { ConstantsUtil } from './ConstantsUtil.js'
import { PresetsUtil } from './PresetsUtil.js'

// -- Types ---------------------------------------------- //
export interface ISolConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: Provider
  coinbase?: Provider
  email?: boolean
  EIP6963?: boolean
  metadata: Metadata
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider {
  request: <T>(args: RequestArguments) => Promise<T>
  on: <T>(event: string, listener: (data: T) => void) => void
  removeListener: <T>(event: string, listener: (data: T) => void) => void
  emit: (event: string) => void
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type CombinedProvider = W3mFrameProvider & Provider

export type Chain = {
  rpcUrl: string
  explorerUrl: string
  currency: string
  name: string
  chainId: number
}

// -- Store--------------------------------------------- //
export interface SolStoreUtilState {
  provider?: Provider | CombinedProvider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963' | 'w3mEmail'
  address?: Address
  chainId?: number
  error?: unknown
  isConnected: boolean
}

type StateKey = keyof SolStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<SolStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  isConnected: false
})


export const SolStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SolStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SolStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: SolStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: SolStoreUtilState['providerType']) {
    state.providerType = providerType
  },

  setAddress(address: SolStoreUtilState['address']) {
    state.address = address
  },

  setChainId(chainId: SolStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setIsConnected(isConnected: SolStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: SolStoreUtilState['error']) {
    state.error = error
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.isConnected = false
    state.error = undefined
  }
}

// -- Constants --------------------------------------------- //
export const SolConstantsUtil = {
  WALLET_ID: '@w3m/wallet_id',
  ERROR_CODE_UNRECOGNIZED_CHAIN_ID: 4902,
  ERROR_CODE_DEFAULT: 5000
}

// -- Helpers --------------------------------------------- //
export const SolHelpersUtil = {
  getCaipDefaultChain(chain?: Chain) {
    if (!chain) {
      return undefined
    }

    return {
      id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
      name: chain.name,
      imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
    } as CaipNetwork
  },
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },
  numberToHexString(value: number) {
    return `0x${value.toString(16)}`
  },
  async getUserInfo(provider: Provider) {
    const [address, chainId] = await Promise.all([
      SolHelpersUtil.getAddress(provider),
      SolHelpersUtil.getChainId(provider)
    ])

    return { chainId, address }
  },
  async getChainId(provider: Provider) {
    const chainId = await provider.request<string | number>({ method: 'eth_chainId' })

    return Number(chainId)
  },
  async getAddress(provider: Provider) {
    const [address] = await provider.request<string[]>({ method: 'eth_accounts' })

    return address
  },
  async addSolanaChain(provider: Provider, chain: Chain) {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: SolHelpersUtil.numberToHexString(chain.chainId),
          rpcUrls: [chain.rpcUrl],
          chainName: chain.name,
          nativeCurrency: {
            name: chain.currency,
            decimals: 18,
            symbol: chain.currency
          },
          blockExplorerUrls: [chain.explorerUrl],
          iconUrls: [PresetsUtil.EIP155NetworkImageIds[chain.chainId]]
        }
      ]
    })
  }
}
