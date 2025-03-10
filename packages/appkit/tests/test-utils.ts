import { vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import {
  AccountController,
  BlockchainApiController,
  CoreHelperUtil,
  StorageUtil
} from '@reown/appkit-core'

import { mockLocalStorage } from './mocks/LocalStorage.js'
import { mainnet } from './mocks/Networks.js'

// Common mock for window and document objects used across tests
export function mockWindowAndDocument() {
  vi.stubGlobal('window', {
    location: { origin: '' },
    matchMedia: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  } as unknown as Window & typeof globalThis)

  vi.stubGlobal('document', {
    body: {
      insertAdjacentElement: vi.fn()
    } as unknown as HTMLElement,
    createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
    getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
    querySelector: vi.fn()
  } as unknown as Document)

  vi.stubGlobal('localStorage', mockLocalStorage() as unknown as Storage)
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

export function mockCoreHelperUtil() {
  vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
}
