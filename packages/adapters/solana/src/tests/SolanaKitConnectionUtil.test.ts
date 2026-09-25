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
})
