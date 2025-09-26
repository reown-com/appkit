import { AlertController, ApiController, ConstantsUtil } from '@reown/appkit-controllers'

import type { AppKitOptionsWithSdk } from '../client/appkit-base-client.js'
import { buildFeatureBag } from '../config/build.js'
import type { FeatureBag, Json } from '../config/types.js'

export const ConfigUtil = {
  async fetchRemoteFeatures(config: AppKitOptionsWithSdk): Promise<FeatureBag> {
    const isBasic = config.basic ?? false
    const locals = (config.features ?? {}) as Record<string, Json | undefined>

    let api: Array<{ id: string; isEnabled?: boolean | null; config?: Json | null }> | null = null
    let isApi = false

    try {
      api = await ApiController.fetchProjectConfig()
      isApi = Boolean(api)
    } catch (e) {
      console.warn(
        '[Reown Config] Failed to fetch remote project configuration. Using local/default values.',
        e
      )
    }

    const defaults = ConstantsUtil.DEFAULT_REMOTE_FEATURES as Record<string, Json | undefined>

    let result: { featureBag: FeatureBag; overriddenKeys: string[] } | null = null
    try {
      result = buildFeatureBag({
        defaults,
        locals,
        api: api ?? undefined,
        isApi,
        isBasic
      })
    } catch (e) {
      console.warn('[Reown Config] Error processing configuration, falling back to defaults:', e)
      // Fallback to defaults when we can't build the feature bag

      return ConstantsUtil.DEFAULT_REMOTE_FEATURES as FeatureBag
    }

    // Show warning if local settings were overridden by remote config
    if (isApi && result && result.overriddenKeys.length > 0) {
      const warningMessage = `Your local configuration for ${result.overriddenKeys.join(', ')} was ignored because a remote configuration was successfully fetched. Please manage these features via your project dashboard on dashboard.reown.com.`
      AlertController.open(
        {
          debugMessage: warningMessage
        },
        'warning'
      )
    }

    return result?.featureBag || ConstantsUtil.DEFAULT_REMOTE_FEATURES
  }
}
