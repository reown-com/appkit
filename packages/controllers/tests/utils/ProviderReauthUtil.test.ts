import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ChainController,
  isCoinbaseConnectorId,
  isUnauthorizedProviderError,
  maybeWrapCoinbaseProvider,
  withCoinbaseReauth
} from '../../exports/index.js'

// -- Helpers ------------------------------------------------------------------
const unauthorized = () => ({
  code: 4100,
  message: "Must call 'eth_requestAccounts' before other methods"
})

/**
 * Minimal EIP-1193-ish provider whose `request` is a spy. `impl` decides the
 * behaviour per call so we can script "fail 4100 → succeed on retry".
 */
function createProvider(impl: (args: { method: string; params?: unknown }) => Promise<unknown>) {
  return {
    request: vi.fn(impl),
    on: vi.fn(),
    removeListener: vi.fn()
  }
}

// -- Tests --------------------------------------------------------------------
describe('isCoinbaseConnectorId', () => {
  it('matches Coinbase connector ids, tolerating casing variants', () => {
    expect(isCoinbaseConnectorId('coinbaseWallet')).toBe(true)
    expect(isCoinbaseConnectorId('coinbaseWalletSDK')).toBe(true)
    // wagmi restore path can surface connector.type.toUpperCase()
    expect(isCoinbaseConnectorId('COINBASEWALLET')).toBe(true)
    expect(isCoinbaseConnectorId('walletConnect')).toBe(false)
    expect(isCoinbaseConnectorId('injected')).toBe(false)
    expect(isCoinbaseConnectorId('EXTERNAL')).toBe(false)
    expect(isCoinbaseConnectorId(undefined)).toBe(false)
  })
})

describe('maybeWrapCoinbaseProvider', () => {
  it('wraps an eip155 Coinbase provider (by connector id, not remapped type)', () => {
    const provider = createProvider(async () => null)
    const wrapped = maybeWrapCoinbaseProvider({
      connectorId: 'coinbaseWalletSDK',
      chainNamespace: 'eip155',
      provider
    })
    expect(wrapped).not.toBe(provider)
  })

  it('leaves a non-Coinbase provider untouched (identity preserved)', () => {
    const provider = createProvider(async () => null)
    // The ethers/live paths remap Coinbase to type 'EXTERNAL'; guarding on the
    // connector id (not the type) is what makes the fix adapter-agnostic.
    const same = maybeWrapCoinbaseProvider({
      connectorId: 'walletConnect',
      chainNamespace: 'eip155',
      provider
    })
    expect(same).toBe(provider)
  })

  it('does not wrap a Coinbase connector on a non-eip155 namespace', () => {
    const provider = createProvider(async () => null)
    const same = maybeWrapCoinbaseProvider({
      connectorId: 'coinbaseWalletSDK',
      chainNamespace: 'solana',
      provider
    })
    expect(same).toBe(provider)
  })
})

describe('isUnauthorizedProviderError', () => {
  it('matches EIP-1193 code 4100', () => {
    expect(isUnauthorizedProviderError({ code: 4100 })).toBe(true)
  })

  it('matches the eth_requestAccounts wording without a code', () => {
    expect(
      isUnauthorizedProviderError({
        message: "Must call 'eth_requestAccounts' before other methods"
      })
    ).toBe(true)
  })

  it('walks the cause chain', () => {
    const nested = { message: 'wrapped', cause: { code: 4100 } }
    expect(isUnauthorizedProviderError(nested)).toBe(true)
  })

  it('does not treat user rejection (4001) or plain errors as unauthorized', () => {
    expect(isUnauthorizedProviderError({ code: 4001, message: 'User rejected' })).toBe(false)
    expect(isUnauthorizedProviderError(new Error('boom'))).toBe(false)
    expect(isUnauthorizedProviderError(undefined)).toBe(false)
  })

  it('is cycle-safe via bounded depth', () => {
    const cyclic: { message: string; cause?: unknown } = { message: 'x' }
    cyclic.cause = cyclic
    expect(isUnauthorizedProviderError(cyclic)).toBe(false)
  })
})

describe('withCoinbaseReauth', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes through a successful request without re-auth', async () => {
    const provider = createProvider(async () => '0xresult')
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_sign' })).resolves.toBe('0xresult')
    expect(provider.request).toHaveBeenCalledTimes(1)
    expect(provider.request).not.toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
  })

  it('recovers a 4100 by re-authorizing then retrying once', async () => {
    let signAttempts = 0
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_signTypedData_v4') {
        signAttempts += 1
        if (signAttempts === 1) {
          throw unauthorized()
        }

        return '0xsig'
      }

      return null
    })
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_signTypedData_v4' })).resolves.toBe('0xsig')
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
    // original (fail) + requestAccounts + retry (success) = 3
    expect(provider.request).toHaveBeenCalledTimes(3)
  })

  it('re-asserts the active chain before retrying eth_sendTransaction', async () => {
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({ id: 8453 } as never)

    let sendAttempts = 0
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_sendTransaction') {
        sendAttempts += 1
        if (sendAttempts === 1) {
          throw unauthorized()
        }

        return '0xhash'
      }

      return null
    })
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_sendTransaction' })).resolves.toBe('0xhash')
    // Base 8453 → 0x2105; asserted before the retry
    expect(provider.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }]
    })
  })

  it('does NOT switch chain when recovering a non-transaction method', async () => {
    const switchSpy = vi.spyOn(ChainController, 'getActiveCaipNetwork')

    let attempts = 0
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_signTypedData_v4') {
        attempts += 1
        if (attempts === 1) {
          throw unauthorized()
        }

        return '0xsig'
      }

      return null
    })
    const wrapped = withCoinbaseReauth(provider)

    await wrapped.request({ method: 'eth_signTypedData_v4' })
    expect(switchSpy).not.toHaveBeenCalled()
    expect(provider.request).not.toHaveBeenCalledWith(
      expect.objectContaining({ method: 'wallet_switchEthereumChain' })
    )
  })

  it('propagates a non-4100 error without attempting re-auth', async () => {
    const rejection = { code: 4001, message: 'User rejected' }
    const provider = createProvider(async () => {
      throw rejection
    })
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_sendTransaction' })).rejects.toBe(rejection)
    expect(provider.request).toHaveBeenCalledTimes(1)
    expect(provider.request).not.toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
  })

  it('propagates a rejected re-auth prompt and does not retry the signing call', async () => {
    const promptRejection = { code: 4001, message: 'User rejected the request' }
    let sendAttempts = 0
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_requestAccounts') {
        throw promptRejection
      }
      if (method === 'eth_sendTransaction') {
        sendAttempts += 1
        throw unauthorized()
      }

      return null
    })
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_sendTransaction' })).rejects.toBe(promptRejection)
    expect(sendAttempts).toBe(1) // no retry after the failed handshake
  })

  it('fails once (no loop) when the retry is still unauthorized', async () => {
    const provider = createProvider(async ({ method }) => {
      if (method === 'eth_requestAccounts') {
        return ['0xabc']
      }
      // eth_signTypedData_v4 always unauthorized
      throw unauthorized()
    })
    const wrapped = withCoinbaseReauth(provider)

    await expect(wrapped.request({ method: 'eth_signTypedData_v4' })).rejects.toMatchObject({
      code: 4100
    })
    // original + requestAccounts + one retry = 3, then it gives up
    expect(provider.request).toHaveBeenCalledTimes(3)
  })

  it('returns a stable wrapper for the same instance and is not double-wrapped', () => {
    const provider = createProvider(async () => null)
    const first = withCoinbaseReauth(provider)
    const second = withCoinbaseReauth(provider)
    expect(first).toBe(second)
    // wrapping the wrapper is a no-op
    expect(withCoinbaseReauth(first)).toBe(first)
  })

  it('delegates non-request members to the raw provider', () => {
    const provider = createProvider(async () => null)
    const wrapped = withCoinbaseReauth(provider)
    const listener = () => undefined

    wrapped.on('accountsChanged', listener)
    expect(provider.on).toHaveBeenCalledWith('accountsChanged', listener)
  })
})
