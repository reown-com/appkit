import { describe, expect, it } from 'vitest'
import { ApiController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      projectId: '',
      page: 1,
      count: 0,
      recommended: [],
      wallets: [],
      search: [],
      sdkVersion: 'html-wagmi-undefined'
    })
  })
})
