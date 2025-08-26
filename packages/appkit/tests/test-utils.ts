import { vi } from 'vitest'

import type { Balance } from '@reown/appkit-common'
import { BlockchainApiController, ChainController, StorageUtil } from '@reown/appkit-controllers'

import { ConfigUtil } from '../src/utils/ConfigUtil.js'
import { mockLocalStorage } from './mocks/LocalStorage.js'
import { mainnet } from './mocks/Networks.js'
import { mockRemoteFeaturesConfig } from './mocks/Options.js'

// Common mock for window and document objects used across tests
export function mockWindowAndDocument() {
  vi.stubGlobal('window', {
    location: { origin: 'http://localhost:3000' },
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

  vi.stubGlobal('navigator', {
    userAgent: '',
    platform: '',
    language: '',
    languages: [],
    onLine: true
  } as unknown as Navigator)
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
  vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValueOnce(response)
}

export function mockRemoteFeatures() {
  vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockImplementation(() =>
    Promise.resolve(mockRemoteFeaturesConfig)
  )
}
