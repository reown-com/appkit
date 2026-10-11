import { describe, expect, it, vi } from 'vitest'

import { waitForSignatureConfirmation } from '../utils/waitForSignatureConfirmation'

function mockConnection(overrides: Record<string, unknown> = {}) {
  return {
    getSignatureStatus: vi.fn().mockResolvedValue({ value: null }),
    ...overrides
  } as any
}

describe('waitForSignatureConfirmation', () => {
  it('should resolve once a non-null signature status is returned', async () => {
    vi.useFakeTimers()
    const connection = mockConnection({
      getSignatureStatus: vi
        .fn()
        .mockResolvedValueOnce({ value: null })
        .mockResolvedValueOnce({ value: { confirmationStatus: 'confirmed' } })
    })

    const promise = waitForSignatureConfirmation(connection, 'sig' as any)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).resolves.toBeUndefined()
    vi.useRealTimers()
  })

  it('should reject when the signature status request fails', async () => {
    vi.useFakeTimers()
    const connection = mockConnection({
      getSignatureStatus: vi.fn().mockRejectedValue(new Error('RPC request failed'))
    })

    const promise = waitForSignatureConfirmation(connection, 'sig' as any)
    const assertion = expect(promise).rejects.toThrow('RPC request failed')

    await vi.advanceTimersByTimeAsync(1000)

    await assertion
    vi.useRealTimers()
  })

  it('should reject with an Error when the request rejects with a non-Error value', async () => {
    vi.useFakeTimers()
    const connection = mockConnection({
      getSignatureStatus: vi.fn().mockRejectedValue('boom')
    })

    const promise = waitForSignatureConfirmation(connection, 'sig' as any)
    const assertion = expect(promise).rejects.toThrow('Signature status request failed')

    await vi.advanceTimersByTimeAsync(1000)

    await assertion
    vi.useRealTimers()
  })

  it('should not start a new request while the previous one is still in flight', async () => {
    vi.useFakeTimers()
    const resolvers: ((value: unknown) => void)[] = []
    const getSignatureStatus = vi.fn(
      () =>
        new Promise(resolve => {
          resolvers.push(resolve)
        })
    )
    const connection = mockConnection({ getSignatureStatus })

    const promise = waitForSignatureConfirmation(connection, 'sig' as any)

    // The first request is issued and never settles.
    await vi.advanceTimersByTimeAsync(1000)
    expect(getSignatureStatus).toHaveBeenCalledTimes(1)

    // Several intervals pass while that request is still pending.
    await vi.advanceTimersByTimeAsync(3000)
    expect(getSignatureStatus).toHaveBeenCalledTimes(1)

    resolvers[0]!({ value: { confirmationStatus: 'confirmed' } })

    await expect(promise).resolves.toBeUndefined()
    vi.useRealTimers()
  })
})
