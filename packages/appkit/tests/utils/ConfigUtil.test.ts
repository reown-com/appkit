import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { OnRampProvider, SwapProvider } from '@reown/appkit-common'
import { AlertController, ApiController } from '@reown/appkit-controllers'
import type { TypedFeatureConfig } from '@reown/appkit-controllers'

import { ConfigUtil } from '../../src/utils/ConfigUtil'
import { mockOptions } from '../mocks/Options'

vi.mock('@reown/appkit-controllers', async () => {
  const actual = await vi.importActual('@reown/appkit-controllers')

  return {
    ...actual,
    ApiController: {
      fetchProjectConfig: vi.fn()
    },
    AlertController: {
      open: vi.fn()
    }
  }
})

describe('ConfigUtil', () => {
  describe('fetchRemoteFeatures', () => {
    beforeEach(() => {
      // Reset mocks before each test
      vi.mocked(ApiController.fetchProjectConfig).mockClear()
      vi.mocked(AlertController.open).mockClear()
    })

    test('should return default features when API returns empty array', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features).toEqual({
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
        activity: false
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should enable email if social_login includes email and isEnabled', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'social_login',
          isEnabled: true,
          config: ['email', 'google']
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.email).toBe(true)
      expect(features.socials).toEqual(['google'])
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should enable socials if social_login has providers and isEnabled', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'social_login',
          isEnabled: true,
          config: ['github', 'discord']
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.socials).toEqual(['github', 'discord'])
      expect(features.email).toBe(false)
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should disable email and socials if social_login is not enabled', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'social_login',
          isEnabled: false,
          config: ['email', 'google']
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.email).toBe(false)
      expect(features.socials).toBe(false)
    })

    test('should enable swaps if swap feature is enabled with config', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'swap',
          isEnabled: true,
          config: ['1inch'] as SwapProvider[]
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.swaps).toEqual(['1inch'])
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should disable swaps if swap feature is not enabled or no config', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'swap',
          isEnabled: false,
          config: ['1inch'] as SwapProvider[]
        } as TypedFeatureConfig
      ])

      let features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.swaps).toBe(false)

      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'swap',
          isEnabled: true,
          config: []
        } as TypedFeatureConfig
      ])

      features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.swaps).toBe(false)
    })

    test('should enable onramp if onramp feature is enabled with config', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'onramp',
          isEnabled: true,
          config: ['coinbase'] as OnRampProvider[]
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.onramp).toEqual(['coinbase'])
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should disable onramp if onramp feature is not enabled or no config', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'onramp',
          isEnabled: false,
          config: ['coinbase'] as OnRampProvider[]
        } as TypedFeatureConfig
      ])

      let features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.onramp).toBe(false)

      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'onramp',
          isEnabled: true,
          config: []
        } as TypedFeatureConfig
      ])

      features = await ConfigUtil.fetchRemoteFeatures(mockOptions)
      expect(features.onramp).toBe(false)
    })

    test('should enable activity if activity feature is enabled', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'activity',
          isEnabled: true
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.activity).toBe(true)
      expect(AlertController.open).not.toHaveBeenCalled()
    })

    test('should disable activity if activity feature is not enabled', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'activity',
          isEnabled: false
        } as TypedFeatureConfig
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features.activity).toBe(false)
    })

    test('should show warning for deprecated history feature flag', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({ ...mockOptions, features: { history: true } as any })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining('features.history" flag is deprecated')
        }),
        'warning'
      )
    })

    test('should show warning for deprecated socials feature flag', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({
        ...mockOptions,
        features: { socials: ['google'] } as any
      })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining('features.socials" flag is deprecated')
        }),
        'warning'
      )
    })

    test('should show warning for deprecated swaps feature flag', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({ ...mockOptions, features: { swaps: true } as any })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining('features.swaps" flag is deprecated')
        }),
        'warning'
      )
    })

    test('should show warning for deprecated onramp feature flag', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({ ...mockOptions, features: { onramp: true } as any })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining('features.onramp" flag is deprecated')
        }),
        'warning'
      )
    })

    test('should show warning for deprecated email feature flag', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({ ...mockOptions, features: { email: true } as any })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining('features.email" flag is deprecated')
        }),
        'warning'
      )
    })

    test('should combine multiple deprecated feature flag warnings', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([])

      await ConfigUtil.fetchRemoteFeatures({
        ...mockOptions,
        features: { history: true, email: true, socials: ['github'] } as any
      })

      expect(AlertController.open).toHaveBeenCalledWith(
        expect.objectContaining({
          shortMessage: 'Local configuration overriden',
          longMessage: expect.stringContaining(
            'features.history" flag is deprecated and no longer supported. The "features.socials" flag is deprecated and no longer supported. The "features.email" flag is deprecated and no longer supported.'
          )
        }),
        'warning'
      )
    })

    test('should correctly parse mixed valid and invalid remote features', async () => {
      vi.mocked(ApiController.fetchProjectConfig).mockResolvedValue([
        {
          id: 'social_login',
          isEnabled: true,
          config: ['email', 'google']
        } as TypedFeatureConfig,
        {
          id: 'swap',
          isEnabled: true,
          config: ['1inch'] as SwapProvider[]
        } as TypedFeatureConfig,
        {
          id: 'onramp',
          isEnabled: false,
          config: ['meld'] as OnRampProvider[]
        } as TypedFeatureConfig,
        {
          id: 'activity',
          isEnabled: true
        } as TypedFeatureConfig,
        {
          id: 'unknown_feature',
          isEnabled: true,
          config: ['something']
        } as any // Cast to any to simulate an unknown feature type
      ])

      const features = await ConfigUtil.fetchRemoteFeatures(mockOptions)

      expect(features).toEqual({
        email: true,
        socials: ['google'],
        swaps: ['1inch'],
        onramp: false,
        activity: true
      })
      expect(AlertController.open).not.toHaveBeenCalled()
    })
  })
})
