import { WalletReadyState } from '@tronweb3/tronwallet-abstract-adapter'
import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'

import { TronConnectUtil } from '../utils/TronConnectUtil'

function createFakeAdapter(readyState: WalletReadyState): Adapter {
  const listeners = new Map<string, Set<(state: WalletReadyState) => void>>()

  return {
    name: 'FakeWallet',
    readyState,
    on(event: string, listener: (state: WalletReadyState) => void) {
      const set = listeners.get(event) ?? new Set()
      set.add(listener)
      listeners.set(event, set)
      return this
    },
    removeListener(event: string, listener: (state: WalletReadyState) => void) {
      listeners.get(event)?.delete(listener)
      return this
    },
    emit(event: string, state: WalletReadyState) {
      listeners.get(event)?.forEach(listener => listener(state))
      return true
    }
  } as unknown as Adapter
}

describe('TronConnectUtil.waitForLoadingAdapters', () => {
  beforeEach(() => {
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('resolves immediately when no adapter is loading', async () => {
    const found = createFakeAdapter(WalletReadyState.Found)
    const notFound = createFakeAdapter(WalletReadyState.NotFound)

    await expect(TronConnectUtil.waitForLoadingAdapters([found, notFound])).resolves.toBeUndefined()
  })

  it('resolves immediately when not running on the client', async () => {
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)
    const loading = createFakeAdapter(WalletReadyState.Loading)

    await expect(TronConnectUtil.waitForLoadingAdapters([loading])).resolves.toBeUndefined()
  })

  it('resolves on the next poll once a loading adapter settles, without waiting for the full timeout', async () => {
    vi.useFakeTimers()
    const loading = createFakeAdapter(WalletReadyState.Loading)

    let resolved = false
    const promise = TronConnectUtil.waitForLoadingAdapters([loading], 3_000).then(() => {
      resolved = true
    })

    ;(loading as unknown as { readyState: WalletReadyState }).readyState = WalletReadyState.Found

    await vi.advanceTimersByTimeAsync(200)
    await promise
    expect(resolved).toBe(true)
  })

  it('does not resolve before every loading adapter settles', async () => {
    vi.useFakeTimers()
    const first = createFakeAdapter(WalletReadyState.Loading)
    const second = createFakeAdapter(WalletReadyState.Loading)

    let resolved = false
    const promise = TronConnectUtil.waitForLoadingAdapters([first, second], 3_000).then(() => {
      resolved = true
    })

    ;(first as unknown as { readyState: WalletReadyState }).readyState = WalletReadyState.Found
    await vi.advanceTimersByTimeAsync(200)
    expect(resolved).toBe(false)
    ;(second as unknown as { readyState: WalletReadyState }).readyState = WalletReadyState.NotFound
    await vi.advanceTimersByTimeAsync(200)
    await promise
    expect(resolved).toBe(true)
  })

  it('resolves after the timeout when an adapter never settles', async () => {
    vi.useFakeTimers()
    const loading = createFakeAdapter(WalletReadyState.Loading)

    let resolved = false
    const promise = TronConnectUtil.waitForLoadingAdapters([loading], 3_000).then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(2_799)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(200)
    await promise
    expect(resolved).toBe(true)
  })
})
