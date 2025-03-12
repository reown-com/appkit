import { ConstantsUtil } from './ConstantsUtil.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import type { Features, FeaturesKeys } from './TypeUtil.js'

export const OptionsUtil = {
  getFeatureValue(key: FeaturesKeys, features?: Features) {
    const optionValue = features?.[key]

    if (optionValue === undefined) {
      return ConstantsUtil.DEFAULT_FEATURES[key] as Features[typeof key]
    }

    return optionValue as Features[typeof key]
  },
  filterSocialsByPlatform<T>(socials: Features['socials']) {
    if (!socials || !socials.length) {
      return socials as T
    }

    if (CoreHelperUtil.isTelegram()) {
      if (CoreHelperUtil.isIos()) {
        return socials.filter(s => s !== 'google')
      }
      if (CoreHelperUtil.isMac()) {
        return socials.filter(s => s !== 'x')
      }
      if (CoreHelperUtil.isAndroid()) {
        return socials.filter(s => !['facebook', 'x'].includes(s))
      }
    }

    return socials
  }
}
