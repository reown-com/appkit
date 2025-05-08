import { describe, expect, it } from 'vitest'

import { OptionsController } from '../../exports/index.js'
import { ConstantsUtil } from '../../src/utils/ConstantsUtil.js'

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      features: ConstantsUtil.DEFAULT_FEATURES,
      projectId: '',
      sdkType: 'appkit',
      sdkVersion: 'html-wagmi-undefined',
      defaultAccountTypes: {
        bip122: 'payment',
        eip155: 'smartAccount',
        polkadot: 'eoa',
        solana: 'eoa'
      },
      enableNetworkSwitch: true
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

  it('should update state correctly on setAllowUnsupportedChain()', () => {
    OptionsController.setAllowUnsupportedChain(true)
    expect(OptionsController.state.allowUnsupportedChain).toEqual(true)
  })

  it('should set defaultAccountType partially and not change if undefined is provided', () => {
    OptionsController.setDefaultAccountTypes({ eip155: 'eoa', bip122: undefined })
    expect(OptionsController.state.defaultAccountTypes).toEqual({
      bip122: 'payment',
      eip155: 'eoa',
      polkadot: 'eoa',
      solana: 'eoa'
    })
  })
})
