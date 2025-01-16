import { describe, expect, it } from 'vitest'

import { ConstantsUtil } from '../../src/utils/ConstantsUtil'
import { OptionsUtil } from '../../src/utils/OptionsUtil'
import type { Features, FeaturesKeys } from '../../src/utils/TypeUtil'

describe('OptionsUtil', () => {
  describe('getFeatureValue', () => {
    it('should return the default value when feature is not provided', () => {
      const defaultValue = ConstantsUtil.DEFAULT_FEATURES.swaps
      const result = OptionsUtil.getFeatureValue('swaps' as FeaturesKeys)
      expect(result).toBe(defaultValue)
    })

    it('should handle disabling feature values', () => {
      const features: Features = {
        swaps: false
      }
      const result = OptionsUtil.getFeatureValue('swaps' as FeaturesKeys, features)
      expect(result).toBe(false)
    })
  })
})
