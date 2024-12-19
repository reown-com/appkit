import { describe, expect, it } from 'vitest'
import { LimitUtil } from '../utils/LimitUtil'

// -- Tests --------------------------------------------------------------------
describe('LimitUtil', () => {
  it('should have valid default state', () => {
    expect(LimitUtil.state).toEqual({
      pendingTransactions: 0
    })
  })

  it('should increase state limit', () => {
    LimitUtil.increase('pendingTransactions')
    expect(LimitUtil.state.pendingTransactions).toBe(1)
  })

  it('should decrease state limit', () => {
    expect(LimitUtil.state.pendingTransactions).toBe(1)
    LimitUtil.decrease('pendingTransactions')
    expect(LimitUtil.state.pendingTransactions).toBe(0)
  })

  it('should reset state limit', () => {
    LimitUtil.increase('pendingTransactions')
    expect(LimitUtil.state.pendingTransactions).toEqual(1)
    LimitUtil.reset('pendingTransactions')
    expect(LimitUtil.state.pendingTransactions).toEqual(0)
  })
})
