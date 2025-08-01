import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { OnRampProvider, SwapProvider } from '@reown/appkit-common'
import {
  ConstantsUtil as ActualConstantsUtil,
  AlertController,
  ApiController
} from '@reown/appkit-controllers'
import type {
  Features as CtrlFeatures,
  RemoteFeatures,
  TypedFeatureConfig
} from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../../src/client/appkit-base-client.js'
import { ConfigUtil } from '../../src/utils/ConfigUtil.js'
import { mockOptions as initialMockOptions } from '../mocks/Options.js'

const getMockOptions = (): AppKitOptionsWithSdk => JSON.parse(JSON.stringify(initialMockOptions))

vi.mock('@reown/appkit-controllers', async () => {
  const actualModule = (await vi.importActual(
    '@reown/appkit-controllers'
  )) as typeof import('@reown/appkit-controllers')

  return {
    ApiController: {
      fetchProjectConfig: vi.fn()
    },
    AlertController: {
      open: vi.fn()
    },
    ConstantsUtil: actualModule.ConstantsUtil
  }
})

const ConstantsUtil = ActualConstantsUtil

describe('ConfigUtil', () => {
  describe('fetchRemoteFeatures', () => {
    let mockOptions: AppKitOptionsWithSdk

    beforeEach(() => {
      mockOptions = getMockOptions()
      vi.mocked(ApiController.fetchProjectConfig).mockReset()
      vi.mocked(AlertController.open).mockReset()
      mockOptions.basic = false
    })

    // --- API Failure Scenarios (Fallback to Local/Defaults) ---
    it('should use local config if API call fails (throws error)', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error('API Error'))
      mockOptions.features = {
        email: true,
        socials: ['google'],
        swaps: false,
        onramp: true,
        history: true
      } as CtrlFeatures
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual({
        email: true,
        socials: ['google'],
        swaps: false,
        onramp: ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp,
        activity: true,
        reownBranding: true,
        multiWallet: false,
        emailCapture: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    it('should use local config if API returns null', async () => {
      // @ts-expect-error - Deliberately testing null response
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(null)
      mockOptions.features = {
        email: false,
        socials: false,
        swaps: true
      } as CtrlFeatures
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual({
        email: false,
        socials: false,
        swaps: ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps,
        onramp: ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp,
        activity: ConstantsUtil.DEFAULT_REMOTE_FEATURES.activity,
        reownBranding: true,
        multiWallet: false,
        emailCapture: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    it('should use default remote features if API fails and no local config (empty features object)', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error('API Error'))
      mockOptions.features = {}
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES)
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    it('should use default remote features if API fails and features is undefined', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error('API Error'))
      delete mockOptions.features
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES)
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    // --- API Success Scenarios (API is Sole Source of Truth) ---
    it('should use API config exclusively, all features off if API returns empty array', async () => {
      // @ts-expect-error - Deliberately testing null response
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(null)
      mockOptions.features = {
        email: true,
        socials: ['google'],
        swaps: true,
        onramp: true,
        history: true
      } as CtrlFeatures
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual({
        email: true,
        socials: ['google'],
        swaps: ['1inch'],
        onramp: ['meld'],
        activity: true,
        reownBranding: true,
        multiWallet: false,
        emailCapture: false
      })
    })

    it('should use API config for all features; unconfigured API features are false/empty', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: ['email'] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = { swaps: true, history: true, socials: ['google'] }
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: true,
        socials: [],
        swaps: false,
        onramp: false,
        multiWallet: false,
        activity: false,
        reownBranding: false,
        emailCapture: false
      })
      expect(AlertController.open).toHaveBeenCalledTimes(1)
      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          debugMessage: expect.stringContaining(
            'Your local configuration for "features.socials" was ignored because a remote configuration was successfully fetched'
          )
        }),
        'warning'
      )
    })

    // --- Basic Mode Tests ---
    it('should force email and socials to false when basic mode is true, regardless of API response', async () => {
      mockOptions.basic = true
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: ['email'] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValueOnce(apiResponse)
      mockOptions.basic = true
      mockOptions.features = { swaps: true, history: true, socials: ['google'] }
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
        activity: false,
        multiWallet: false,
        reownBranding: false,
        emailCapture: false
      })
    })

    it('should use full API config, ignoring all local settings and warning', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: ['email', 'discord'] },
        { id: 'swap', isEnabled: true, config: ['1inch'] as SwapProvider[] },
        { id: 'onramp', isEnabled: false, config: [] as OnRampProvider[] },
        { id: 'activity', isEnabled: false, config: [] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = {
        email: false,
        socials: ['google'],
        swaps: false,
        onramp: true,
        history: false
      } as CtrlFeatures
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: true,
        socials: ['discord'],
        swaps: ['1inch'],
        onramp: false,
        multiWallet: false,
        activity: false,
        reownBranding: false,
        emailCapture: false
      })
      expect(AlertController.open).toHaveBeenCalledTimes(1)
      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          debugMessage: expect.stringContaining(
            'Your local configuration for "features.email", "features.socials", "features.swaps", "features.onramp", "features.history" (now "activity") was ignored because a remote configuration was successfully fetched'
          )
        }),
        'warning'
      )
    })

    it('should not warn if no local features were defined by user (empty features object) when API succeeds', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: ['email'] },
        { id: 'swap', isEnabled: true, config: ['1inch'] as SwapProvider[] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = {}
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: true,
        socials: [],
        swaps: ['1inch'],
        onramp: false,
        multiWallet: false,
        activity: false,
        reownBranding: false,
        emailCapture: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    it('should not warn if local features is undefined when API succeeds', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: ['email'] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      delete mockOptions.features
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: true,
        socials: [],
        swaps: false,
        multiWallet: false,
        onramp: false,
        activity: false,
        reownBranding: false,
        emailCapture: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    it('should turn feature off/empty if API enables it with empty/null config', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'social_login', isEnabled: true, config: [] },
        { id: 'swap', isEnabled: false, config: [] as unknown as SwapProvider[] },
        { id: 'onramp', isEnabled: false, config: false as unknown as OnRampProvider[] },
        { id: 'activity', isEnabled: false, config: [] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = {}
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features).toEqual<RemoteFeatures>({
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
        multiWallet: false,
        activity: false,
        reownBranding: false,
        emailCapture: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    // --- Specific local fallback behaviors (only when API fails) ---
    it('should use default swap providers for local features.swaps=true on API failure', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error())
      mockOptions.features = { swaps: true } as any
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.swaps).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps)
      expect(features.email).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES.email)
    })

    it('should use default onramp providers for local features.onramp=true on API failure', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error())
      mockOptions.features = { onramp: true } as any
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.onramp).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp)
    })

    it('should use default social providers for local features.socials=true on API failure', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error())
      mockOptions.features = { socials: true } as any
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.socials).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials)
    })

    it('should correctly set socials to false for local features.socials=false on API failure', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockRejectedValue(new Error())
      mockOptions.features = { socials: false } as any
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.socials).toBe(false)
    })

    it('should result in email:false and socials:false if social_login API is explicitly missing (on API success)', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'swap', isEnabled: true, config: ['1inch'] as SwapProvider[] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = {}
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.email).toBe(false)
      expect(features.socials).toBe(false)
      expect(features.swaps).toEqual(['1inch'])
    })

    it('should result in activity:false if activity API is explicitly missing (on API success)', async () => {
      const apiResponse: TypedFeatureConfig[] = [
        { id: 'swap', isEnabled: true, config: ['1inch'] as SwapProvider[] }
      ]
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(apiResponse)
      mockOptions.features = {}
      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.activity).toBe(false)
      expect(features.swaps).toEqual(['1inch'])
    })

    it('should use default config when configuration processing throws an error', async () => {
      const malformedApiResponse = [
        { id: 'social_login', isEnabled: true, config: 'invalid_config' }
      ] as unknown as TypedFeatureConfig[]

      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue(malformedApiResponse)

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features).toEqual(ConstantsUtil.DEFAULT_REMOTE_FEATURES)

      expect(AlertController.open).not.toHaveBeenCalled()
    })
  })
})
