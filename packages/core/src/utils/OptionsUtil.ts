import { ConstantsUtil } from './ConstantsUtil.js'
import type { Features, FeaturesKeys } from './TypeUtil.js'

export const OptionsUtil = {
  getFeatureValue(key: FeaturesKeys, features?: Features) {
    const optionValue = features?.[key]

    if (optionValue === undefined) {
      return ConstantsUtil.DEFAULT_FEATURES[key] as Features[typeof key]
    }

    return optionValue as Features[typeof key]
  }
}
