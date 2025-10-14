import { OptionsController } from '../controllers/OptionsController.js'
import { ConstantsUtil } from './ConstantsUtil.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import type { Features, FeaturesKeys, RemoteFeatures } from './TypeUtil.js'

export const OptionsUtil = {
  getFeatureValue(key: FeaturesKeys, features?: Features) {
    const optionValue = features?.[key]

    if (optionValue === undefined) {
      return ConstantsUtil.DEFAULT_FEATURES[key] as Features[typeof key]
    }

    return optionValue as Features[typeof key]
  },
  filterSocialsByPlatform<T>(socials: RemoteFeatures['socials']) {
    if (!socials || !socials.length) {
      return socials as T
    }

    let filteredSocials = socials

    if (CoreHelperUtil.isTelegram()) {
      if (CoreHelperUtil.isIos()) {
        filteredSocials = filteredSocials.filter(s => s !== 'google')
      }
      if (CoreHelperUtil.isMac()) {
        filteredSocials = filteredSocials.filter(s => s !== 'x')
      }
      if (CoreHelperUtil.isAndroid()) {
        filteredSocials = filteredSocials.filter(s => !['facebook', 'x'].includes(s))
      }
    }

    if (CoreHelperUtil.isMobile()) {
      filteredSocials = filteredSocials.filter(s => s !== 'facebook')
    }

    return filteredSocials
  },
  isSocialsEnabled() {
    return (
      (Array.isArray(OptionsController.state.features?.socials) &&
        OptionsController.state.features?.socials.length > 0) ||
      (Array.isArray(OptionsController.state.remoteFeatures?.socials) &&
        OptionsController.state.remoteFeatures?.socials.length > 0)
    )
  },
  isEmailEnabled() {
    return Boolean(
      OptionsController.state.features?.email || OptionsController.state.remoteFeatures?.email
    )
  }
}
