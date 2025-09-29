import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OptionsController } from '../../exports/index.js'
import { ConstantsUtil } from '../../src/utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import { OptionsUtil } from '../../src/utils/OptionsUtil.js'
import type { RemoteFeatures, SocialProvider } from '../../src/utils/TypeUtil.js'

vi.mock('../../src/utils/OptionsUtil.js', () => ({
  OptionsUtil: {
    filterSocialsByPlatform: vi.fn(socials => socials)
  }
}))

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  beforeEach(() => {
    vi.mocked(OptionsUtil.filterSocialsByPlatform).mockClear()
    OptionsController.state.remoteFeatures = {}
  })

  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      features: ConstantsUtil.DEFAULT_FEATURES,
      remoteFeatures: {},
      projectId: '',
      sdkType: 'appkit',
      sdkVersion: 'html-wagmi-undefined',
      defaultAccountTypes: {
        bip122: 'payment',
        eip155: 'smartAccount',
        polkadot: 'eoa',
        solana: 'eoa'
      },
      enableNetworkSwitch: true,
      experimental_preferUniversalLinks: false,
      enableMobileFullScreen: false
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

  it('should update state correctly on setFeatures()', () => {
    OptionsController.setFeatures({
      analytics: true
    })

    expect(OptionsController.state.features).toEqual({
      ...OptionsController.state.features,
      analytics: true
    })
  })

  it('should do nothing if remoteFeatures is undefined', () => {
    const initialState = { ...OptionsController.state }
    OptionsController.setRemoteFeatures(undefined)
    expect(OptionsController.state).toEqual(initialState)
    expect(OptionsUtil.filterSocialsByPlatform).not.toHaveBeenCalled()
  })

  it('should set remoteFeatures and call OptionsUtil.filterSocialsByPlatform if socials data exists', () => {
    const socialProviders = ['google' as SocialProvider]
    const filteredSocialProviders = ['google' as SocialProvider]
    vi.mocked(OptionsUtil.filterSocialsByPlatform).mockReturnValue(filteredSocialProviders)

    const remoteFeatures: RemoteFeatures = {
      socials: socialProviders,
      activity: true
    }
    OptionsController.setRemoteFeatures(remoteFeatures)
    expect(OptionsController.state.remoteFeatures?.socials).toEqual(filteredSocialProviders)
    expect(OptionsController.state.remoteFeatures?.activity).toBe(true)
    expect(OptionsUtil.filterSocialsByPlatform).toHaveBeenCalledWith(socialProviders)
  })

  it('should correctly set SIWX defaults for provided SIWX config', () => {
    OptionsController.setSIWX({} as any)
    const keys = Object.keys(
      ConstantsUtil.SIWX_DEFAULTS
    ) as (keyof typeof ConstantsUtil.SIWX_DEFAULTS)[]
    keys.forEach(key => {
      expect(OptionsController.state.siwx![key]).toEqual(ConstantsUtil.SIWX_DEFAULTS[key])
    })

    // Test setting signOutOnDisconnect to false
    OptionsController.setSIWX({ signOutOnDisconnect: false } as any)
    expect(OptionsController.state.siwx!.signOutOnDisconnect).toEqual(false)
  })

  it('should set enableMobileFullScreen to false when not on mobile', () => {
    const spy = vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    OptionsController.setEnableMobileFullScreen(true)
    expect(OptionsController.state.enableMobileFullScreen).toBe(false)
    spy.mockRestore()
  })

  it('should set enableMobileFullScreen to true when on mobile', () => {
    const spy = vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    OptionsController.setEnableMobileFullScreen(true)
    expect(OptionsController.state.enableMobileFullScreen).toBe(true)
    spy.mockRestore()
  })
})
