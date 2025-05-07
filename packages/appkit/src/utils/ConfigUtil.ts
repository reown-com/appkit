import { ApiController } from '@reown/appkit-controllers'
import type { FeatureID, SocialProvider, TypedFeatureConfig } from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'

export const ConfigUtil = {
  async checkConfig(config: AppKitOptionsWithSdk) {
    const response = await ApiController.fetchProjectConfig()

    // Helper to get a specific feature config and narrow its type
    function getSpecificConfig<T extends FeatureID>(id: T) {
      return response.find((f): f is Extract<TypedFeatureConfig, { id: T }> => f.id === id)
    }

    const socialLoginConfig = getSpecificConfig('social_login')
    const swapConfig = getSpecificConfig('swap')
    const onRampConfig = getSpecificConfig('onramp')
    const activityConfig = getSpecificConfig('activity')

    const currentFeatures = config.features || {}

    config.features = {
      ...currentFeatures,
      email:
        socialLoginConfig?.isEnabled && socialLoginConfig.config
          ? socialLoginConfig.config.includes('email')
          : false,
      socials:
        socialLoginConfig?.isEnabled && socialLoginConfig.config
          ? socialLoginConfig.config.filter(
              (s: SocialProvider | 'email'): s is SocialProvider => s !== 'email'
            )
          : false,
      swaps:
        swapConfig?.isEnabled && swapConfig.config && swapConfig.config.length > 0
          ? swapConfig.config
          : false,
      onramp:
        onRampConfig?.isEnabled && onRampConfig.config && onRampConfig.config.length > 0
          ? onRampConfig.config
          : false,
      analytics: activityConfig?.isEnabled || false
    }

    return config
  }
}
