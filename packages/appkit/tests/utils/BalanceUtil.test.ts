import { describe, expect, it, vi } from 'vitest'

import { updateBalance } from '../../src/utils/BalanceUtil'
import { mockUserBalance } from '../mocks/Account'
import mockAppKit from '../mocks/AppKit'

describe('BalanceUtil', () => {
  describe('updateBalance', () => {
    it('should return success with balance data when updateNativeBalance succeeds', async () => {
      mockAppKit.getAddress = vi.fn().mockReturnValue('0x1234567890')
      mockAppKit.getActiveChainNamespace = vi.fn().mockReturnValue('eip155')
      mockAppKit.getCaipNetwork = vi
        .fn()
        .mockReturnValue({ id: '1', name: 'Ethereum', chain: 'eip155' })
      mockAppKit.updateNativeBalance = vi.fn().mockResolvedValue(mockUserBalance)

      const result = await updateBalance(mockAppKit)

      expect(mockAppKit.updateNativeBalance).toHaveBeenCalledTimes(1)
      expect(mockAppKit.updateNativeBalance).toHaveBeenCalledWith('0x1234567890', '1', 'eip155')
      expect(result).toEqual({
        data: mockUserBalance,
        error: null,
        isSuccess: true,
        isError: false
      })
    })

    it('should return error when updateNativeBalance returns undefined', async () => {
      mockAppKit.getAddress = vi.fn().mockReturnValue('0x1234567890')
      mockAppKit.getActiveChainNamespace = vi.fn().mockReturnValue('eip155')
      mockAppKit.getCaipNetwork = vi
        .fn()
        .mockReturnValue({ id: '1', name: 'Ethereum', chain: 'eip155' })
      mockAppKit.updateNativeBalance = vi.fn().mockResolvedValue(undefined)

      const result = await updateBalance(mockAppKit)

      expect(mockAppKit.updateNativeBalance).toHaveBeenCalledTimes(1)
      expect(mockAppKit.updateNativeBalance).toHaveBeenCalledWith('0x1234567890', '1', 'eip155')
      expect(result).toEqual({
        data: undefined,
        error: 'No balance found',
        isSuccess: false,
        isError: true
      })
    })
  })
})
