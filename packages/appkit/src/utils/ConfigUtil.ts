/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertController, ApiController } from '@reown/appkit-controllers'
import type {
  FeatureID,
  RemoteFeatures,
  SocialProvider,
  TypedFeatureConfig
} from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'

export const ConfigUtil = {
  async fetchRemoteFeatures(config: AppKitOptionsWithSdk) {
    const warnings = []

    if ((config.features as any)?.history) {
      warnings.push('The "features.history" flag is deprecated and no longer supported.')
    }

    if ((config.features as any)?.socials) {
      warnings.push('The "features.socials" flag is deprecated and no longer supported.')
    }

    if ((config.features as any)?.swaps) {
      warnings.push('The "features.swaps" flag is deprecated and no longer supported.')
    }

    if ((config.features as any)?.onramp) {
      warnings.push('The "features.onramp" flag is deprecated and no longer supported.')
    }

    if ((config.features as any)?.email) {
      warnings.push('The "features.email" flag is deprecated and no longer supported.')
    }

    if (warnings.length > 0) {
      AlertController.open(
        {
          shortMessage: 'Local configuration overriden',
          longMessage: `[Reown Config Warning] ${warnings.join(' ')} Your config has been overriden by the config from your project at cloud.reown.com. Please configure via the Cloud Dashboard: https://cloud.reown.com/`
        },
        'warning'
      )
    }

    const response = await ApiController.fetchProjectConfig()

    // Helper to get a specific feature config and narrow its type
    function getSpecificConfig<T extends FeatureID>(id: T) {
      return response.find((f): f is Extract<TypedFeatureConfig, { id: T }> => f.id === id)
    }

    const socialLoginConfig = getSpecificConfig('social_login')
    const swapConfig = getSpecificConfig('swap')
    const onRampConfig = getSpecificConfig('onramp')
    const activityConfig = getSpecificConfig('activity')

    let remoteFeaturesConfig: RemoteFeatures = {}

    remoteFeaturesConfig = {
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
      activity: activityConfig?.isEnabled || false
    }

    return remoteFeaturesConfig
  }
}
