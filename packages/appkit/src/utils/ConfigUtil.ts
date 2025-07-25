/* eslint-disable max-params */
import type { OnRampProvider, SocialProvider, SwapProvider } from '@reown/appkit-common'
import { AlertController, ApiController, ConstantsUtil } from '@reown/appkit-controllers'
import type {
  EmailCaptureOptions,
  FeatureConfigMap,
  FeatureID,
  RemoteFeatures,
  TypedFeatureConfig
} from '@reown/appkit-controllers'
import type {} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'

type FeatureKey = keyof FeatureConfigMap

const FEATURE_KEYS: FeatureKey[] = [
  'email',
  'socials',
  'swaps',
  'onramp',
  'activity',
  'reownBranding',
  'multiWallet',
  'emailCapture'
]

const featureConfig = {
  email: {
    apiFeatureName: 'social_login' as const,
    localFeatureName: 'email',
    returnType: false as boolean,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): boolean => {
      if (!apiConfig?.config) {
        return false
      }
      const config = apiConfig.config as (SocialProvider | 'email')[]

      return Boolean(apiConfig.isEnabled) && config.includes('email')
    },
    processFallback: (localValue: unknown): boolean => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.email
      }

      return Boolean(localValue)
    }
  },
  socials: {
    apiFeatureName: 'social_login' as const,
    localFeatureName: 'socials',
    returnType: false as SocialProvider[] | false,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): SocialProvider[] | false => {
      if (!apiConfig?.config) {
        return false
      }
      const config = apiConfig.config as (SocialProvider | 'email')[]

      return Boolean(apiConfig.isEnabled) && config.length > 0
        ? config.filter((s): s is SocialProvider => s !== 'email')
        : false
    },
    processFallback: (localValue: unknown): SocialProvider[] | false => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials
      }
      if (typeof localValue === 'boolean') {
        return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials : false
      }

      return localValue as SocialProvider[] | false
    }
  },
  swaps: {
    apiFeatureName: 'swap' as const,
    localFeatureName: 'swaps',
    returnType: false as SwapProvider[] | false,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): SwapProvider[] | false => {
      if (!apiConfig?.config) {
        return false
      }
      const config = apiConfig.config as SwapProvider[]

      return Boolean(apiConfig.isEnabled) && config.length > 0 ? config : false
    },
    processFallback: (localValue: unknown): SwapProvider[] | false => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps
      }
      if (typeof localValue === 'boolean') {
        return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps : false
      }

      return localValue as SwapProvider[] | false
    }
  },
  onramp: {
    apiFeatureName: 'onramp' as const,
    localFeatureName: 'onramp',
    returnType: false as OnRampProvider[] | false,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): OnRampProvider[] | false => {
      if (!apiConfig?.config) {
        return false
      }
      const config = apiConfig.config as OnRampProvider[]

      return Boolean(apiConfig.isEnabled) && config.length > 0 ? config : false
    },
    processFallback: (localValue: unknown): OnRampProvider[] | false => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp
      }
      if (typeof localValue === 'boolean') {
        return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp : false
      }

      return localValue as OnRampProvider[] | false
    }
  },
  activity: {
    apiFeatureName: 'activity' as const,
    localFeatureName: 'history',
    returnType: false as boolean,
    isLegacy: true,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): boolean => Boolean(apiConfig.isEnabled),
    processFallback: (localValue: unknown): boolean => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.activity
      }

      return Boolean(localValue)
    }
  },
  reownBranding: {
    apiFeatureName: 'reown_branding' as const,
    localFeatureName: 'reownBranding',
    returnType: false as boolean,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): boolean => Boolean(apiConfig.isEnabled),
    processFallback: (localValue: unknown): boolean => {
      if (localValue === undefined) {
        return ConstantsUtil.DEFAULT_REMOTE_FEATURES.reownBranding
      }

      return Boolean(localValue)
    }
  },
  emailCapture: {
    apiFeatureName: 'email_capture' as const,
    localFeatureName: 'emailCapture',
    returnType: false as EmailCaptureOptions[] | boolean,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig): EmailCaptureOptions[] | false =>
      apiConfig.isEnabled && ((apiConfig.config ?? []) as EmailCaptureOptions[]),
    processFallback: (_localValue: unknown): EmailCaptureOptions[] | boolean => false
  },
  multiWallet: {
    apiFeatureName: 'multi_wallet' as const,
    localFeatureName: 'multiWallet',
    returnType: false as boolean,
    isLegacy: false,
    isAvailableOnBasic: false,
    processApi: (apiConfig: TypedFeatureConfig) => Boolean(apiConfig.isEnabled),
    processFallback: () => ConstantsUtil.DEFAULT_REMOTE_FEATURES.multiWallet
  }
}

export const ConfigUtil = {
  localSettingsOverridden: new Set<string>(),

  getApiConfig<T extends FeatureID>(id: T, apiProjectConfig: TypedFeatureConfig[] | null) {
    return apiProjectConfig?.find((f): f is Extract<TypedFeatureConfig, { id: T }> => f.id === id)
  },

  addWarning(localFeatureValue: unknown, featureKey: FeatureKey): void {
    if (localFeatureValue !== undefined) {
      const config = featureConfig[featureKey]
      const warningName = config.isLegacy
        ? `"features.${config.localFeatureName}" (now "${featureKey}")`
        : `"features.${featureKey}"`
      this.localSettingsOverridden.add(warningName)
    }
  },

  processFeature<K extends FeatureKey>(
    featureKey: K,
    localFeatures: Record<string, unknown>,
    apiProjectConfig: TypedFeatureConfig[] | null,
    useApi: boolean,
    isBasic: boolean
  ): FeatureConfigMap[K]['returnType'] {
    const config = featureConfig[featureKey]
    const localValue = localFeatures[config.localFeatureName]

    if (isBasic && !config.isAvailableOnBasic) {
      return false as FeatureConfigMap[K]['returnType']
    }

    if (useApi) {
      const apiConfig = this.getApiConfig(config.apiFeatureName, apiProjectConfig)

      if (apiConfig?.config === null) {
        return this.processFallbackFeature(featureKey, localValue)
      }

      if (!apiConfig?.config) {
        return false as FeatureConfigMap[K]['returnType']
      }

      if (localValue !== undefined) {
        this.addWarning(localValue, featureKey)
      }

      return this.processApiFeature(featureKey, apiConfig)
    }

    return this.processFallbackFeature(featureKey, localValue)
  },

  processApiFeature<K extends FeatureKey>(
    featureKey: K,
    apiConfig: TypedFeatureConfig
  ): FeatureConfigMap[K]['returnType'] {
    return featureConfig[featureKey].processApi(apiConfig)
  },

  processFallbackFeature<K extends FeatureKey>(
    featureKey: K,
    localValue: unknown
  ): FeatureConfigMap[K]['returnType'] {
    return featureConfig[featureKey].processFallback(localValue)
  },

  async fetchRemoteFeatures(config: AppKitOptionsWithSdk): Promise<RemoteFeatures> {
    const isBasic = config.basic ?? false
    const localFeatures = config.features || {}

    this.localSettingsOverridden.clear()

    let apiProjectConfig: TypedFeatureConfig[] | null = null
    let useApiConfig = false

    try {
      apiProjectConfig = await ApiController.fetchProjectConfig()
      useApiConfig = apiProjectConfig !== null && apiProjectConfig !== undefined
    } catch (e) {
      console.warn(
        '[Reown Config] Failed to fetch remote project configuration. Using local/default values.',
        e
      )
    }

    const remoteFeaturesConfig: RemoteFeatures =
      useApiConfig && !isBasic
        ? ConstantsUtil.DEFAULT_REMOTE_FEATURES
        : ConstantsUtil.DEFAULT_REMOTE_FEATURES_DISABLED

    try {
      for (const featureKey of FEATURE_KEYS) {
        const result = this.processFeature(
          featureKey,
          localFeatures,
          apiProjectConfig,
          useApiConfig,
          isBasic
        )
        Object.assign(remoteFeaturesConfig, { [featureKey]: result })
      }
    } catch (e) {
      console.warn(
        '[Reown Config] Failed to process the configuration from Cloud. Using default values.',
        e
      )

      return ConstantsUtil.DEFAULT_REMOTE_FEATURES
    }

    if (useApiConfig && this.localSettingsOverridden.size > 0) {
      const warningMessage = `Your local configuration for ${Array.from(this.localSettingsOverridden).join(', ')} was ignored because a remote configuration was successfully fetched. Please manage these features via your project dashboard on dashboard.reown.com.`
      AlertController.open(
        {
          debugMessage:
            ErrorUtil.ALERT_WARNINGS.LOCAL_CONFIGURATION_IGNORED.debugMessage(warningMessage)
        },
        'warning'
      )
    }

    return remoteFeaturesConfig
  }
}
