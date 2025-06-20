import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HelpersUtil } from '../src/HelpersUtil.js'

describe('HelpersUtil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
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
  })
})
