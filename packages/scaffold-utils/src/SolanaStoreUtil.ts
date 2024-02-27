import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/utils'
import { Connection } from '@solana/web3.js'

import UniversalProvider from '@walletconnect/universal-provider'

import type { Chain, CombinedProvider, Provider } from './SolanaTypesUtil.js'

type StateKey = keyof SolStoreUtilState

export interface SolStoreUtilState {
    projectId: string
    provider?: Provider | CombinedProvider | UniversalProvider
    providerType?: 'walletConnect' | `injected_${string}` | 'coinbaseWallet' | 'eip6963' | 'w3mEmail'
    address?: string
    chainId?: string
    caipChainId?: string
    currentChain?: Chain
    requestId?: number
    error?: unknown
    connection: Connection | null
    isConnected: boolean
}

const state = proxy<SolStoreUtilState>({
    projectId: '',
    provider: undefined,
    providerType: undefined,
    address: undefined,
    currentChain: undefined,
    chainId: undefined,
    caipChainId: undefined,
    connection: null,
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

    getProjectId() {
        return state.projectId
    },

    setProjectId(projectId: string) {
        state.projectId = projectId
    },

    setAddress(address: string) {
        state.address = address
    },

    setConnection(connection: Connection) {
        state.connection = connection
    },

    setChainId(chainId: SolStoreUtilState['chainId']) {
        state.chainId = chainId
    },

    setCaipChainId(caipChainId: SolStoreUtilState['caipChainId']) {
        state.caipChainId = caipChainId
    },

    setIsConnected(isConnected: SolStoreUtilState['isConnected']) {
        state.isConnected = isConnected
    },

    setError(error: SolStoreUtilState['error']) {
        state.error = error
    },

    setCurrentChain(chain: Chain) {
        state.currentChain = chain
    },

    getCluster() {
        const chain = state.currentChain ?? {
            chainId: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
            name: 'Solana',
            currency: 'SOL',
            explorerUrl: 'https://solscan.io',
            rpcUrl: 'https://rpc.walletconnect.com/v1?chainId=solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ&projectId=bbcbaddb9e8a1ae8f5f7c60f3e5a666e'
        }

        return {
            name: chain.name,
            id: chain.chainId,
            endpoint: chain.rpcUrl
        }
    },

    getNewRequestId() {
        const curId = state.requestId ?? 0
        state.requestId = curId + 1

        return state.requestId
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