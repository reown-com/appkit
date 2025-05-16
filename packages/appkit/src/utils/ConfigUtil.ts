import type { SocialProvider } from '@reown/appkit-common'
import { AlertController, ApiController, ConstantsUtil } from '@reown/appkit-controllers'
import type { FeatureID, RemoteFeatures, TypedFeatureConfig } from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'

export const ConfigUtil = {
  async fetchRemoteFeatures(config: AppKitOptionsWithSdk): Promise<RemoteFeatures> {
    const localFeatures = config.features || {}
    const { DEFAULT_REMOTE_FEATURES } = ConstantsUtil
    const warnings: string[] = []
    let remoteFeaturesConfig: RemoteFeatures = { ...DEFAULT_REMOTE_FEATURES }

    let apiProjectConfig: TypedFeatureConfig[] | null = null
    let isApiCallSuccessful = false

    function getApiConfig<T extends FeatureID>(id: T) {
      if (!apiProjectConfig) {
        return undefined
      }

      return apiProjectConfig.find((f): f is Extract<TypedFeatureConfig, { id: T }> => f.id === id)
    }

    try {
      apiProjectConfig = await ApiController.fetchProjectConfig()
      apiProjectConfig = apiProjectConfig === undefined || null ? null : apiProjectConfig
      isApiCallSuccessful = true
    } catch (e) {
      console.warn(
        '[Reown Config] Failed to fetch remote project configuration. Using local/default values.',
        e
      )
    }

    if (isApiCallSuccessful && apiProjectConfig !== null) {
      remoteFeaturesConfig = {
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
        activity: false,
        reownBranding: false
      }

      const socialLoginApi = getApiConfig('social_login')
      if (socialLoginApi) {
        remoteFeaturesConfig.email =
          socialLoginApi.isEnabled && socialLoginApi.config
            ? socialLoginApi.config.includes('email')
            : false
        remoteFeaturesConfig.socials =
          socialLoginApi.isEnabled && socialLoginApi.config
            ? socialLoginApi.config.filter(
                (s: SocialProvider | 'email'): s is SocialProvider => s !== 'email'
              )
            : false
      }

      const swapsApi = getApiConfig('swap')
      if (swapsApi) {
        remoteFeaturesConfig.swaps =
          swapsApi.isEnabled && swapsApi.config && swapsApi.config.length > 0
            ? swapsApi.config
            : false
      }

      const onRampApi = getApiConfig('onramp')
      if (onRampApi) {
        remoteFeaturesConfig.onramp =
          onRampApi.isEnabled && onRampApi.config && onRampApi.config.length > 0
            ? onRampApi.config
            : false
      }

      const activityApi = getApiConfig('activity')
      if (activityApi) {
        remoteFeaturesConfig.activity = activityApi.isEnabled ?? false
      }

      const reownBrandingApi = getApiConfig('reownBranding')
      if (reownBrandingApi) {
        remoteFeaturesConfig.reownBranding = false
      }

      if (localFeatures.email !== undefined) {
        warnings.push('"features.email"')
      }
      if (localFeatures.socials !== undefined) {
        warnings.push('"features.socials"')
      }
      if (localFeatures.swaps !== undefined) {
        warnings.push('"features.swaps"')
      }
      if (localFeatures.onramp !== undefined) {
        warnings.push('"features.onramp"')
      }
      if (localFeatures.history !== undefined) {
        warnings.push('"features.history" (now "activity")')
      }

      if (warnings.length > 0) {
        const warningMessage = `Your local configuration for ${warnings.join(', ')} was ignored because a remote configuration was successfully fetched. Please manage these features via your project dashboard.`
        AlertController.open(
          {
            shortMessage: 'Local configuration ignored',
            longMessage: `[Reown Config Notice] ${warningMessage}`
          },
          'warning'
        )
      }
    } else {
      if (typeof localFeatures.email === 'boolean') {
        remoteFeaturesConfig.email = localFeatures.email
      } else {
        remoteFeaturesConfig.email = DEFAULT_REMOTE_FEATURES.email
      }

      if (localFeatures.socials) {
        if (typeof localFeatures.socials === 'boolean') {
          remoteFeaturesConfig.socials = DEFAULT_REMOTE_FEATURES.socials
        } else {
          remoteFeaturesConfig.socials = localFeatures.socials
        }
      } else if (localFeatures.socials === undefined) {
        remoteFeaturesConfig.socials = DEFAULT_REMOTE_FEATURES.socials
      } else {
        remoteFeaturesConfig.socials = false
      }

      if (typeof localFeatures.swaps === 'boolean') {
        if (localFeatures.swaps) {
          remoteFeaturesConfig.swaps = DEFAULT_REMOTE_FEATURES.swaps
        } else {
          remoteFeaturesConfig.swaps = false
        }
      } else if (typeof localFeatures.swaps === 'undefined') {
        remoteFeaturesConfig.swaps = DEFAULT_REMOTE_FEATURES.swaps
      } else {
        remoteFeaturesConfig.swaps = localFeatures.swaps
      }

      if (typeof localFeatures.onramp === 'boolean') {
        if (localFeatures.onramp) {
          remoteFeaturesConfig.onramp = DEFAULT_REMOTE_FEATURES.onramp
        } else {
          remoteFeaturesConfig.onramp = false
        }
      } else if (typeof localFeatures.onramp === 'undefined') {
        remoteFeaturesConfig.onramp = DEFAULT_REMOTE_FEATURES.onramp
      } else {
        remoteFeaturesConfig.onramp = localFeatures.onramp
      }

      if (localFeatures.history) {
        remoteFeaturesConfig.activity = localFeatures.history
      } else if (localFeatures.history === undefined) {
        remoteFeaturesConfig.activity = DEFAULT_REMOTE_FEATURES.activity
      } else {
        remoteFeaturesConfig.activity = false
      }

      remoteFeaturesConfig.reownBranding = DEFAULT_REMOTE_FEATURES.reownBranding
    }

    return remoteFeaturesConfig
  }
}
