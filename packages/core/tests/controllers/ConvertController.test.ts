import { describe, expect, it } from 'vitest'
import { ConvertController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('ConvertController', () => {
  it('should have default state as expected', () => {
    expect(ConvertController.state.initialized).toEqual(false)
    expect(ConvertController.state.tokens).toEqual([])
    expect(ConvertController.state.sourceToken).toEqual(undefined)
    expect(ConvertController.state.toToken).toEqual(undefined)
  })
})
