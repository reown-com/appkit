import { describe, expect, it } from 'vitest'
import { ConnectorController } from '../../index'

// -- Tests --------------------------------------------------------------------
describe('ExplorerApiController', () => {
  it('should have valid default state', () => {
    expect(ConnectorController.state).toEqual({
      projectId: '',
      page: 1,
      total: 0,
      listings: [],
      search: []
    })
  })
})
