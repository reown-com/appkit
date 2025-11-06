import { vi } from 'vitest'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { CaipNetworkId } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

import {
  type AccountState,
  type AdapterNetworkState,
  type ChainAdapter,
  ChainController,
  type ChainControllerState
} from '../exports/index.js'

export const extendedMainnet = {
  id: 1,
  caipNetworkId: 'eip155:1',
  chainNamespace: 'eip155',
  name: 'Ethereum Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: [],
      webSocket: undefined
    }
  }
} as CaipNetwork

export const solanaCaipNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainNamespace: 'solana',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: { default: { http: [] } },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } }
} as CaipNetwork

export function mockChainControllerState(
  state: Partial<
    Omit<ChainControllerState, 'chains'> & {
      chains: Map<
        ChainNamespace,
        Partial<Omit<ChainAdapter, 'accountState' | 'networkState'>> & {
          accountState?: Partial<AccountState>
          networkState?: Partial<AdapterNetworkState>
        }
      >
    }
  >
) {
  // @ts-expect-error - we need to mock the state
  vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
    ...ChainController.state,
    ...state
  })
}

export function updateChainsMap(
  namespace: ChainNamespace,
  state: Partial<Omit<ChainAdapter, 'accountState' | 'networkState'>> & {
    accountState?: Partial<AccountState>
    networkState?: Partial<AdapterNetworkState>
  }
) {
  const currentState = ChainController.state.chains.get(namespace)
  // @ts-expect-error - we need to mock the state
  ChainController.state.chains.set(namespace, { ...currentState, ...state })
}

export function mockAccountState(state: AccountState) {
  vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
    ...ChainController.getAccountData(),
    ...state
  })
}

type MockSessionReplaces = {
  [K in keyof SIWXSession]?: Partial<SIWXSession[K]>
}

export function mockSession(
  replaces: MockSessionReplaces = { data: {}, message: '', signature: '' }
): SIWXSession {
  return {
    data: {
      domain: 'example.com',
      accountAddress: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA',
      statement: 'This is a statement',
      chainId: 'eip155:1' as CaipNetworkId,
      uri: 'siwx://example.com',
      version: '1',
      nonce: '123',
      ...replaces.data
    },
    message: replaces.message || 'Hello AppKit!',
    signature:
      replaces.signature ||
      '0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c'
  }
}
