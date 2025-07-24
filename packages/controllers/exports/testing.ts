import { vi } from 'vitest'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

import {
  AccountController,
  type AccountControllerState,
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

export function mockChainControllerState(
  state: Partial<
    Omit<ChainControllerState, 'chains'> & {
      chains: Map<
        ChainNamespace,
        Partial<Omit<ChainAdapter, 'accountState' | 'networkState'>> & {
          accountState?: Partial<AccountControllerState>
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
    accountState?: Partial<AccountControllerState>
    networkState?: Partial<AdapterNetworkState>
  }
) {
  const currentState = ChainController.state.chains.get(namespace)
  // @ts-expect-error - we need to mock the state
  ChainController.state.chains.set(namespace, { ...currentState, ...state })
}

export function mockAccountControllerState(state: AccountControllerState) {
  vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
    ...AccountController.state,
    ...state
  })
}
