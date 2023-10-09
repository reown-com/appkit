import { describe, expect, it } from 'vitest'
import { OptionsController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      projectId: '',
      sdkType: 'w3m',
      sdkVersion: 'html-wagmi-undefined'
    })
  })

  it('should update state correctly on setProjectId()', () => {
    OptionsController.setProjectId('123')
    expect(OptionsController.state.projectId).toEqual('123')
  })

  it('should update state correctly on setSdkVersion()', () => {
    OptionsController.setSdkVersion('react-wagmi-3.0.0')
    expect(OptionsController.state.sdkVersion).toEqual('react-wagmi-3.0.0')
  })
})
