import { describe, expect, it } from 'vitest'
import { ExplorerApiController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('ExplorerApiController', () => {
  it('should have valid default state', () => {
    expect(ExplorerApiController.state).toEqual({
      projectId: '',
      page: 1,
      total: 0,
      listings: [],
      recommended: [],
      search: [],
      images: {}
    })
  })
})
