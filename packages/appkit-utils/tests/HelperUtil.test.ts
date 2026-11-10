import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HelpersUtil } from '../src/HelpersUtil.js'

describe('HelpersUtil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('withRetry', () => {
    it('should retry condition function until success or max retries reached', async () => {
      let attempts = 0
      const conditionFn = vi.fn(() => {
        attempts++
        return attempts >= 3
      })

      const promise = HelpersUtil.withRetry({
        conditionFn,
        intervalMs: 100,
        maxRetries: 5
      })

      await vi.advanceTimersByTimeAsync(100)
      await vi.advanceTimersByTimeAsync(100)

      const result = await promise

      expect(result).toBe(true)
      expect(conditionFn).toHaveBeenCalledTimes(3)
    })

    it('should return false when max retries exceeded', async () => {
      const conditionFn = vi.fn(() => false)

      const promise = HelpersUtil.withRetry({
        conditionFn,
        intervalMs: 50,
        maxRetries: 3
      })

      await vi.advanceTimersByTimeAsync(50)
      await vi.advanceTimersByTimeAsync(50)
      await vi.advanceTimersByTimeAsync(50)

      const result = await promise

      expect(result).toBe(false)
      expect(conditionFn).toHaveBeenCalledTimes(3)
    })

    it('should handle async condition functions', async () => {
      let attempts = 0

      const conditionFn = vi.fn(async () => {
        attempts++
        return attempts >= 2
      })

      const promise = HelpersUtil.withRetry({
        conditionFn,
        intervalMs: 100,
        maxRetries: 3
      })

      await vi.advanceTimersByTimeAsync(100)

      const result = await promise

      expect(result).toBe(true)
      expect(conditionFn).toHaveBeenCalledTimes(2)
    })

    it('should succeed immediately when condition is true on first try', async () => {
      const conditionFn = vi.fn(() => true)

      const promise = HelpersUtil.withRetry({
        conditionFn,
        intervalMs: 100,
        maxRetries: 5
      })

      const result = await promise

      expect(result).toBe(true)
      expect(conditionFn).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['throws', false],
      ['rejects', true]
    ])('should reject with the original reason when the first check %s', async (_, isAsync) => {
      const reason = new Error('Condition failed')
      const conditionFn = vi.fn(() => {
        if (isAsync) {
          return Promise.reject(reason)
        }

        throw reason
      })

      const promise = HelpersUtil.withRetry({ conditionFn, intervalMs: 100, maxRetries: 3 })

      await expect(promise).rejects.toBe(reason)
      await vi.runAllTimersAsync()
      expect(conditionFn).toHaveBeenCalledTimes(1)
      expect(vi.getTimerCount()).toBe(0)
    })

    it.each([
      ['throws', false],
      ['rejects', true]
    ])('should reject with the original reason when a later check %s', async (_, isAsync) => {
      const reason = { message: 'Condition failed' }
      const conditionFn = vi.fn<() => boolean | Promise<boolean>>().mockReturnValueOnce(false)
      conditionFn.mockImplementation(() => {
        if (isAsync) {
          return Promise.reject(reason)
        }

        throw reason
      })

      const promise = HelpersUtil.withRetry({ conditionFn, intervalMs: 100, maxRetries: 3 })
      const rejection = expect(promise).rejects.toBe(reason)

      await vi.advanceTimersByTimeAsync(100)
      await rejection
      await vi.runAllTimersAsync()
      expect(conditionFn).toHaveBeenCalledTimes(2)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should wait the full interval between checks and stop after success', async () => {
      const conditionFn = vi.fn().mockReturnValueOnce(false).mockReturnValue(true)
      const promise = HelpersUtil.withRetry({ conditionFn, intervalMs: 100, maxRetries: 3 })

      expect(conditionFn).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(99)
      expect(conditionFn).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(1)
      await expect(promise).resolves.toBe(true)
      await vi.runAllTimersAsync()
      expect(conditionFn).toHaveBeenCalledTimes(2)
      expect(vi.getTimerCount()).toBe(0)
    })

    it.each([0, -1])('should check once when maxRetries is %s', async maxRetries => {
      const conditionFn = vi.fn(() => false)
      const promise = HelpersUtil.withRetry({ conditionFn, intervalMs: 100, maxRetries })

      await expect(promise).resolves.toBe(false)
      await vi.runAllTimersAsync()
      expect(conditionFn).toHaveBeenCalledTimes(1)
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('getOtherAuthNamespaces', () => {
    it('should return empty array if no active namespace', () => {
      const otherAuthNamespaces = HelpersUtil.getOtherAuthNamespaces(undefined)
      expect(otherAuthNamespaces).toEqual([])
    })

    it('should return all auth namespaces except the active one (eip155)', () => {
      const activeNamespace = 'eip155'
      const otherAuthNamespaces = HelpersUtil.getOtherAuthNamespaces(activeNamespace)
      expect(otherAuthNamespaces).toEqual(['solana'])
    })

    it('should return all auth namespaces except the active one (solana)', () => {
      const activeNamespace = 'solana'
      const otherAuthNamespaces = HelpersUtil.getOtherAuthNamespaces(activeNamespace)
      expect(otherAuthNamespaces).toEqual(['eip155'])
    })
  })
})
