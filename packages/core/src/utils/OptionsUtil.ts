import { DEFAULT_FEATURES } from '../controllers/OptionsController.js'
import type { Features, FeaturesKeys } from '../controllers/OptionsController.js'

export const OptionsUtil = {
  getFeatureValue(key: FeaturesKeys, features?: Features) {
    const optionValue = features?.[key]

    if (optionValue === undefined) {
      return DEFAULT_FEATURES[key] as Features[typeof key]
    }

    return optionValue as Features[typeof key]
  }
}
