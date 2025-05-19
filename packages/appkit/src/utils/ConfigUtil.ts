import type { SocialProvider } from '@reown/appkit-common'
import { AlertController, ApiController, ConstantsUtil } from '@reown/appkit-controllers'
import type { FeatureID, RemoteFeatures, TypedFeatureConfig } from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'

export const ConfigUtil = {
  async fetchRemoteFeatures(config: AppKitOptionsWithSdk): Promise<RemoteFeatures> {
    const localFeatures = config.features || {}
    const { DEFAULT_REMOTE_FEATURES } = ConstantsUtil
    let remoteFeaturesConfig: RemoteFeatures = { ...DEFAULT_REMOTE_FEATURES }

    let apiProjectConfig: TypedFeatureConfig[] | null = null
    let isApiCallSuccessful = false
    const localSettingsOverridden = new Set<string>()

    function getApiConfig<T extends FeatureID>(id: T) {
      if (!apiProjectConfig) {
        return undefined
      }

      return apiProjectConfig.find((f): f is Extract<TypedFeatureConfig, { id: T }> => f.id === id)
    }

    function addWarning(
      localFeatureValue: unknown,
      featureName: string,
      isActivityHistory?: boolean
    ): void {
      if (localFeatureValue !== undefined) {
        localSettingsOverridden.add(
          isActivityHistory ? `"features.history" (now "activity")` : `"features.${featureName}"`
        )
      }
    }

    try {
      apiProjectConfig = await ApiController.fetchProjectConfig()
      apiProjectConfig =
        apiProjectConfig === undefined || apiProjectConfig === null ? null : apiProjectConfig
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
        if (socialLoginApi.isEnabled === null && socialLoginApi.config === null) {
          if (typeof localFeatures.email === 'boolean') {
            remoteFeaturesConfig.email = localFeatures.email
          } else {
            remoteFeaturesConfig.email = DEFAULT_REMOTE_FEATURES.email
          }
          if (typeof localFeatures.socials === 'boolean') {
            remoteFeaturesConfig.socials = localFeatures.socials
              ? DEFAULT_REMOTE_FEATURES.socials
              : false
          } else {
            remoteFeaturesConfig.socials = localFeatures.socials ?? DEFAULT_REMOTE_FEATURES.socials
          }
        } else {
          addWarning(localFeatures.email, 'email')
          addWarning(localFeatures.socials, 'socials')
          remoteFeaturesConfig.email =
            Boolean(socialLoginApi.isEnabled) && socialLoginApi.config
              ? socialLoginApi.config.includes('email')
              : false
          remoteFeaturesConfig.socials =
            Boolean(socialLoginApi.isEnabled) && socialLoginApi.config
              ? socialLoginApi.config.filter(
                  (s: SocialProvider | 'email'): s is SocialProvider => s !== 'email'
                )
              : false
        }
      } else {
        addWarning(localFeatures.email, 'email')
        addWarning(localFeatures.socials, 'socials')
      }

      const swapsApi = getApiConfig('swap')
      if (swapsApi) {
        if (swapsApi.isEnabled === null && swapsApi.config === null) {
          if (typeof localFeatures.swaps === 'boolean') {
            remoteFeaturesConfig.swaps = localFeatures.swaps ? DEFAULT_REMOTE_FEATURES.swaps : false
          } else if (localFeatures.swaps === undefined) {
            remoteFeaturesConfig.swaps = DEFAULT_REMOTE_FEATURES.swaps
          } else {
            remoteFeaturesConfig.swaps = localFeatures.swaps
          }
        } else {
          addWarning(localFeatures.swaps, 'swaps')
          remoteFeaturesConfig.swaps =
            Boolean(swapsApi.isEnabled) && swapsApi.config && swapsApi.config.length > 0
              ? swapsApi.config
              : false
        }
      } else {
        addWarning(localFeatures.swaps, 'swaps')
      }

      const onRampApi = getApiConfig('onramp')
      if (onRampApi) {
        if (onRampApi.isEnabled === null && onRampApi.config === null) {
          if (typeof localFeatures.onramp === 'boolean') {
            remoteFeaturesConfig.onramp = localFeatures.onramp
              ? DEFAULT_REMOTE_FEATURES.onramp
              : false
          } else if (localFeatures.onramp === undefined) {
            remoteFeaturesConfig.onramp = DEFAULT_REMOTE_FEATURES.onramp
          } else {
            remoteFeaturesConfig.onramp = localFeatures.onramp
          }
        } else {
          addWarning(localFeatures.onramp, 'onramp')
          remoteFeaturesConfig.onramp =
            Boolean(onRampApi.isEnabled) && onRampApi.config && onRampApi.config.length > 0
              ? onRampApi.config
              : false
        }
      } else {
        addWarning(localFeatures.onramp, 'onramp')
      }

      const activityApi = getApiConfig('activity')
      if (activityApi) {
        if (activityApi.isEnabled === null && activityApi.config === null) {
          if (typeof localFeatures.history === 'boolean') {
            remoteFeaturesConfig.activity = localFeatures.history
              ? DEFAULT_REMOTE_FEATURES.activity
              : false
          } else if (localFeatures.history === undefined) {
            remoteFeaturesConfig.activity = DEFAULT_REMOTE_FEATURES.activity
          } else {
            remoteFeaturesConfig.activity = localFeatures.history
          }
        } else {
          addWarning(localFeatures.history, 'history', true)
          remoteFeaturesConfig.activity = activityApi.isEnabled ?? false
        }
      } else {
        addWarning(localFeatures.history, 'history', true)
      }

      const reownBrandingApi = getApiConfig('reown_branding')
      if (reownBrandingApi) {
        if (reownBrandingApi.isEnabled === null && reownBrandingApi.config === null) {
          remoteFeaturesConfig.reownBranding = DEFAULT_REMOTE_FEATURES.reownBranding
        } else {
          remoteFeaturesConfig.reownBranding = reownBrandingApi.isEnabled ?? false
        }
      }

      if (localSettingsOverridden.size > 0) {
        const warningMessage = `Your local configuration for ${Array.from(localSettingsOverridden).join(', ')} was ignored because a remote configuration was successfully fetched. Please manage these features via your project dashboard on dashboard.reown.com.`
        AlertController.open(
          {
            shortMessage: 'Local configuration ignored',
            longMessage: `[Reown Config Notice] ${warningMessage}`
          },
          'warning'
        )
      }
    } else {
      remoteFeaturesConfig = { ...DEFAULT_REMOTE_FEATURES }

      if (typeof localFeatures.email === 'boolean') {
        remoteFeaturesConfig.email = localFeatures.email
      }

      if (localFeatures.socials !== undefined) {
        if (typeof localFeatures.socials === 'boolean') {
          remoteFeaturesConfig.socials = localFeatures.socials
            ? DEFAULT_REMOTE_FEATURES.socials
            : false
        } else {
          remoteFeaturesConfig.socials = localFeatures.socials
        }
      }

      if (localFeatures.swaps !== undefined) {
        if (typeof localFeatures.swaps === 'boolean') {
          remoteFeaturesConfig.swaps = localFeatures.swaps ? DEFAULT_REMOTE_FEATURES.swaps : false
        } else {
          remoteFeaturesConfig.swaps = localFeatures.swaps
        }
      }

      if (localFeatures.onramp !== undefined) {
        if (typeof localFeatures.onramp === 'boolean') {
          remoteFeaturesConfig.onramp = localFeatures.onramp
            ? DEFAULT_REMOTE_FEATURES.onramp
            : false
        } else {
          remoteFeaturesConfig.onramp = localFeatures.onramp
        }
      }

      if (localFeatures.history !== undefined) {
        remoteFeaturesConfig.activity = localFeatures.history
      }
    }

    return remoteFeaturesConfig
  }
}
