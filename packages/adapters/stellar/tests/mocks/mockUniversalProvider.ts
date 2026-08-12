import type UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

export function mockUniversalProvider(
  replaces: Partial<UniversalProvider> = {}
): UniversalProvider {
  return {
    connect: vi.fn().mockResolvedValue({}),
    disconnect: vi.fn(),
    request: vi.fn(),
    on: vi.fn(),
    client: {
      core: {
        crypto: {
          getClientId: vi.fn(() => Promise.resolve('client-id'))
        }
      }
    },
    setDefaultChain: vi.fn(),
    ...replaces
  } as UniversalProvider
}
