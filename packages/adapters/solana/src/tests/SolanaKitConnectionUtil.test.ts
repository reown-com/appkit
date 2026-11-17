import { describe, expect, it, vi } from 'vitest'

import {
  getBalanceKit,
  getLatestBlockhashKit,
  waitForSignatureConfirmationKit
} from '../utils/SolanaKitConnectionUtil'

function mockRpc(overrides: Record<string, unknown> = {}) {
  return {
    getBalance: vi.fn().mockReturnValue({ send: () => Promise.resolve({ value: 1_500_000_000n }) }),
    getLatestBlockhash: vi.fn().mockReturnValue({
      send: () => Promise.resolve({ value: { blockhash: 'abc', lastValidBlockHeight: 100n } })
    }),
    getSignatureStatuses: vi
      .fn()
      .mockReturnValue({ send: () => Promise.resolve({ value: [null] }) }),
    ...overrides
  } as any
}

describe('getBalanceKit', () => {
  it('should return the lamports balance', async () => {
    const rpc = mockRpc()
    const result = await getBalanceKit(rpc, 'address' as any)
    expect(result).toBe(1_500_000_000n)
    expect(rpc.getBalance).toHaveBeenCalledWith('address')
  })
})

describe('getLatestBlockhashKit', () => {
  it('should return the blockhash and lastValidBlockHeight', async () => {
    const rpc = mockRpc()
    const result = await getLatestBlockhashKit(rpc)
    expect(result).toEqual({ blockhash: 'abc', lastValidBlockHeight: 100n })
  })
})

describe('waitForSignatureConfirmationKit', () => {
  it('should resolve once a non-null signature status is returned', async () => {
    vi.useFakeTimers()
    const rpc = mockRpc({
      getSignatureStatuses: vi
        .fn()
        .mockReturnValueOnce({ send: () => Promise.resolve({ value: [null] }) })
        .mockReturnValueOnce({
          send: () => Promise.resolve({ value: [{ confirmationStatus: 'confirmed' }] })
        })
    })

    const promise = waitForSignatureConfirmationKit(rpc, 'sig' as any)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).resolves.toBeUndefined()
    vi.useRealTimers()
  })

  it('should reject when the signature status request fails', async () => {
    vi.useFakeTimers()
    const error = new Error('RPC request failed')
    const rpc = mockRpc({
      getSignatureStatuses: vi.fn().mockReturnValue({ send: () => Promise.reject(error) })
    })

    const promise = waitForSignatureConfirmationKit(rpc, 'sig' as any)
    const assertion = expect(promise).rejects.toThrow('RPC request failed')

    await vi.advanceTimersByTimeAsync(1000)

    await assertion
    vi.useRealTimers()
  })

  it('should reject with an Error when the request rejects with a non-Error value', async () => {
    vi.useFakeTimers()
    const rpc = mockRpc({
      getSignatureStatuses: vi.fn().mockReturnValue({ send: () => Promise.reject('boom') })
    })

    const promise = waitForSignatureConfirmationKit(rpc, 'sig' as any)
    const assertion = expect(promise).rejects.toThrow('Signature status request failed')

    await vi.advanceTimersByTimeAsync(1000)

    await assertion
    vi.useRealTimers()
  })

  it('should not start a new request while the previous one is still in flight', async () => {
    vi.useFakeTimers()
    const resolvers: ((value: unknown) => void)[] = []
    const send = vi.fn(
      () =>
        new Promise(resolve => {
          resolvers.push(resolve)
        })
    )
    const rpc = mockRpc({ getSignatureStatuses: vi.fn().mockReturnValue({ send }) })

    const promise = waitForSignatureConfirmationKit(rpc, 'sig' as any)

    // The first request is issued and never settles.
    await vi.advanceTimersByTimeAsync(1000)
    expect(send).toHaveBeenCalledTimes(1)

    // Several intervals pass while that request is still pending.
    await vi.advanceTimersByTimeAsync(3000)
    expect(send).toHaveBeenCalledTimes(1)

    resolvers[0]!({ value: [{ confirmationStatus: 'confirmed' }] })

    await expect(promise).resolves.toBeUndefined()
    vi.useRealTimers()
  })
})
