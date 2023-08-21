import { describe, expect, it } from 'vitest'
import { OptionsController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      projectId: ''
    })
  })

  it('should update state correctly on setProjectId()', () => {
    OptionsController.setProjectId('123')
    expect(OptionsController.state.projectId).toEqual('123')
  })
})
