import { describe, expect, it } from 'vitest'
import { LimitterUtil } from '../utils/LimitterUtil'

// -- Tests --------------------------------------------------------------------
describe('LimitterUtil', () => {
  it('should have valid default state', () => {
    expect(LimitterUtil.state).toEqual({
      pendingTransactions: 0
    })
  })

  it('should increase state limit', () => {
    LimitterUtil.increase('pendingTransactions')
    expect(LimitterUtil.state.pendingTransactions).toBe(1)
  })

  it('should decrease state limit', () => {
    expect(LimitterUtil.state.pendingTransactions).toBe(1)
    LimitterUtil.decrease('pendingTransactions')
    expect(LimitterUtil.state.pendingTransactions).toBe(0)
  })

  it('should reset state limit', () => {
    LimitterUtil.increase('pendingTransactions')
    expect(LimitterUtil.state.pendingTransactions).toEqual(1)
    LimitterUtil.reset('pendingTransactions')
    expect(LimitterUtil.state.pendingTransactions).toEqual(0)
  })
})
