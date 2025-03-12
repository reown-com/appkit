import { vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  type ChainControllerState,
  StorageUtil
} from '@reown/appkit-core'

import { mainnet, unsupportedNetwork } from './mocks/Networks.js'

// Common mock for window and document objects used across tests
export function mockWindowAndDocument() {
  vi.mocked(global).window = { location: { origin: '' } } as unknown as Window & typeof globalThis
  vi.mocked(global).document = {
    body: {
      insertAdjacentElement: vi.fn()
    } as unknown as HTMLElement,
    createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
    getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
    querySelector: vi.fn()
  } as unknown as Document
}

export function mockBlockchainApiController() {
  vi.spyOn(BlockchainApiController, 'getSupportedNetworks').mockResolvedValue({
    http: ['eip155:1', 'eip155:137'],
    ws: ['eip155:1', 'eip155:137']
  })
}

export function mockStorageUtil() {
  vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValue({
    namespace: mainnet.chainNamespace,
    caipNetworkId: mainnet.caipNetworkId,
    chainId: mainnet.id
  })
}

export function mockFetchTokenBalanceOnce(response: Balance[]) {
  vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValueOnce(response)
}

export function mockChainControllerStateWithUnsupportedChain() {
  vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
    ...ChainController.state,
    activeChain: mainnet.chainNamespace,
    activeCaipNetwork: unsupportedNetwork
  } as unknown as ChainControllerState)
}
