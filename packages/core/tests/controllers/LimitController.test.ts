import { describe, expect, it } from 'vitest'
import { LimitController } from '../../src/controllers/LimitController.js'

// -- Tests --------------------------------------------------------------------
describe('LimitController', () => {
  it('should have valid default state', () => {
    expect(LimitController.state).toEqual({
      pendingTransactions: 0
    })
  })

  it('should increase state limit', () => {
    LimitController.increase('pendingTransactions')
    expect(LimitController.state.pendingTransactions).toBe(1)
  })

  it('should decrease state limit', () => {
    expect(LimitController.state.pendingTransactions).toBe(1)
    LimitController.decrease('pendingTransactions')
    expect(LimitController.state.pendingTransactions).toBe(0)
  })

  it('should reset state limit', () => {
    LimitController.increase('pendingTransactions')
    expect(LimitController.state.pendingTransactions).toEqual(1)
    LimitController.reset('pendingTransactions')
    expect(LimitController.state.pendingTransactions).toEqual(0)
  })
})
