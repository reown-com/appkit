import { describe, expect, it } from 'vitest'
import { ConstantsUtil, OptionsController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      projectId: '',
      sdkType: 'w3m',
      sdkVersion: 'html-wagmi-undefined',
      allWallets: ConstantsUtil.DEFAULT_FEATURES.allWallets,
      disableAppend: ConstantsUtil.DEFAULT_FEATURES.disableAppend,
      enableAnalytics: ConstantsUtil.DEFAULT_FEATURES.analytics,
      enableEIP6963: ConstantsUtil.DEFAULT_FEATURES.enableEIP6963,
      enableOnramp: ConstantsUtil.DEFAULT_FEATURES.onramp,
      enableSwaps: ConstantsUtil.DEFAULT_FEATURES.swaps
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
