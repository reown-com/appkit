import { describe, expect, it } from 'vitest'
import { ApiController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      featured: [],
      recommended: [],
      wallets: [],
      search: [],
      sdkVersion: 'html-wagmi-undefined'
    })
  })
})
