import { describe, expect, it, vi } from 'vitest'

import { updateBalance } from '../../src/utils/BalanceUtil'
import { mockUserBalance } from '../mocks/Account'
import mockAppKit from '../mocks/AppKit'

describe('BalanceUtil', () => {
  describe('updateBalance', () => {
    it('should return success with balance data when fetchBalance succeeds', async () => {
      mockAppKit.fetchBalance = vi.fn().mockResolvedValue(mockUserBalance)

      const result = await updateBalance(mockAppKit)

      expect(mockAppKit.fetchBalance).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        data: mockUserBalance,
        error: null,
        isSuccess: true,
        isError: false
      })
    })

    it('should return error when fetchBalance returns undefined', async () => {
      mockAppKit.fetchBalance = vi.fn().mockResolvedValue(undefined)

      const result = await updateBalance(mockAppKit)

      expect(mockAppKit.fetchBalance).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        data: undefined,
        error: 'No balance found',
        isSuccess: false,
        isError: true
      })
    })
  })
})
