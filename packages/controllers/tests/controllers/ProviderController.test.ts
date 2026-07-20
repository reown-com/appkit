import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProviderController } from '../../exports/index.js'
import type { ConnectorType } from '../../src/utils/TypeUtil.js'

// -- Helpers ------------------------------------------------------------------
function createProvider(impl: (args: { method: string; params?: unknown }) => Promise<unknown>) {
  return { request: vi.fn(impl), on: vi.fn() }
}

// `getProviderId` stores `ConnectResult.type`, which the wagmi restore path sets
// to `connector.type.toUpperCase()` (e.g. `'COINBASEWALLET'`) via a lie-cast, so
// the runtime values here are cast to match reality rather than the declared union.
const asProviderId = (id: string) => id as ConnectorType

// -- Tests --------------------------------------------------------------------
describe('ProviderController', () => {
  afterEach(() => {
    ProviderController.reset()
    vi.restoreAllMocks()
  })

  it('stores a non-Coinbase provider unwrapped (identity preserved)', () => {
    const provider = createProvider(async () => null)
    ProviderController.setProviderId('eip155', asProviderId('WALLET_CONNECT'))
    ProviderController.setProvider('eip155', provider)

    expect(ProviderController.getProvider('eip155')).toBe(provider)
  })

  it('does not wrap a Coinbase provider on a non-eip155 namespace', () => {
    const provider = createProvider(async () => null)
    ProviderController.setProviderId('solana', asProviderId('COINBASEWALLET'))
    ProviderController.setProvider('solana', provider)

    expect(ProviderController.getProvider('solana')).toBe(provider)
  })

  it('wraps a Coinbase eip155 provider so 4100 self-heals via the stored provider', async () => {
    let attempts = 0
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_signTypedData_v4') {
        attempts += 1
        if (attempts === 1) {
          throw { code: 4100, message: "Must call 'eth_requestAccounts' before other methods" }
        }

        return '0xsig'
      }

      return null
    })

    ProviderController.setProviderId('eip155', asProviderId('COINBASEWALLET'))
    ProviderController.setProvider('eip155', provider)

    const stored = ProviderController.getProvider<{
      request: (a: { method: string }) => Promise<unknown>
    }>('eip155')

    // The stored provider is the wrapper, not the raw instance
    expect(stored).not.toBe(provider)
    await expect(stored?.request({ method: 'eth_signTypedData_v4' })).resolves.toBe('0xsig')
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
  })
})
