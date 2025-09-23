import type { ApiEntry, FeatureBag, Json, Layer } from './types.js'

/**
 * Mapping of API feature IDs to SDK feature names.
 * The Dashboard can use different naming conventions than the SDK.
 *
 * Adding new mappings here automatically enables:
 * 1. Feature normalization (API ID → SDK name)
 * 2. Warning detection (local config override detection)
 * 3. Reverse mapping support
 */
const FEATURE_ID_ALIASES: Record<string, string> = {
  swap: 'swaps',
  fund_from_exchange: 'payWithExchange',
  multi_wallet: 'multiWallet',
  email_capture: 'emailCapture',
  reown_branding: 'reownBranding',
  reown_authentication: 'reownAuthentication',
  history: 'activity'
}

/**
 * Determines the value to use for a feature when API config is available.
 * This function implements the priority order for feature values:
 * 1. If API provides explicit config, use it
 * 2. If API config is empty array, treat as disabled (false)
 * 3. If API config is undefined, fall back to local config or defaults
 *
 * @param cfg - Configuration value from the API (can be undefined, array, boolean, etc.)
 * @param context - Contains locals, defaults, and the current key being processed
 * @returns The final value to use for this feature
 */
function getFeatureValue(
  cfg: Json | undefined,
  context: { locals?: Layer; defaults?: Layer; key: string; skipEmptyArrayCheck?: boolean }
): Json {
  // If API doesn't provide explicit config, use local config or defaults
  if (cfg === undefined || cfg === null) {
    const localValue = context.locals?.[context.key]

    // Prefer local value when present
    if (localValue !== undefined) {
      // Map boolean true to default provider arrays when applicable
      if (localValue === true && Array.isArray(context.defaults?.[context.key])) {
        return context.defaults?.[context.key] as Json
      }

      return localValue as Json
    }

    // No local value — fall back to defaults (from ConstantsUtil)
    return (context.defaults?.[context.key] as Json) ?? false
  }

  /*
   * Empty array from API indicates the config was set in the Dashboard.
   * In that case:
   * - For features that require provider lists (onramp, socials), preserve the empty array
   *   so the UI can render based on the explicit provider list (even if empty).
   * - For all other features, use the boolean isEnabled state (handled by caller) by
   *   returning true here when isEnabled=true. If isEnabled=false, caller won't reach here.
   *
   * Note: For social_login-derived keys we skip this check via skipEmptyArrayCheck.
   */
  if (Array.isArray(cfg) && cfg.length === 0 && !context.skipEmptyArrayCheck) {
    if (context.key === 'onramp' || context.key === 'socials') {
      return cfg
    }

    return true
  }

  // Use the explicit config value from API
  return cfg
}

/**
 * Converts API feature ID to SDK feature name using the alias mapping.
 *
 * @param apiId - The feature ID from the API
 * @returns The corresponding SDK feature name
 */
function mapApiIdToSdkKey(apiId: string): string {
  return FEATURE_ID_ALIASES[apiId] || apiId
}

/**
 * Handles the special social_login transformation.
 * API: social_login: ['email', 'google'] → SDK: email: true, socials: ['google']
 *
 * @param config - The social_login configuration from API
 * @returns Object with email and socials properties
 */
function transformSocialLogin(config: Json): { email: Json; socials: Json } {
  if (Array.isArray(config)) {
    if (config.length === 0) {
      return { email: false, socials: false }
    }
    const hasEmail = config.includes('email')
    const socials = config.filter(x => x !== 'email')

    return { email: hasEmail, socials }
  } else if (config === false) {
    return { email: false, socials: false }
  } else if (config === true) {
    return { email: false, socials: false }
  } else if (config === null) {
    return { email: null, socials: null }
  } else if (config !== null && config !== undefined) {
    throw new Error(
      `Invalid social_login configuration: expected array, boolean (true/false, both treated as disabled), null, or undefined, got ${typeof config}`
    )
  }

  return { email: false, socials: false }
}

/**
 * Detects if a local feature should trigger a warning due to remote override.
 *
 * @param localKey - Local feature key
 * @param remoteIds - Set of API feature IDs
 * @returns Object with shouldWarn flag and display key for warnings
 */
function detectWarning(
  localKey: string,
  remoteIds: Set<string>
): { shouldWarn: boolean; displayKey: string } {
  // Check: Direct match
  if (remoteIds.has(localKey)) {
    return { shouldWarn: true, displayKey: localKey }
  }

  // Check: Local key maps to remote ID via alias
  const mappedRemoteId = FEATURE_ID_ALIASES[localKey]
  if (mappedRemoteId && remoteIds.has(mappedRemoteId)) {
    return { shouldWarn: true, displayKey: `${localKey}" (now "${mappedRemoteId}")` }
  }

  // Check: Reverse mapping - remote ID maps to local key
  for (const [remoteId, sdkKey] of Object.entries(FEATURE_ID_ALIASES)) {
    if (sdkKey === localKey && remoteIds.has(remoteId)) {
      return { shouldWarn: true, displayKey: localKey }
    }
  }

  // Check: Special case - social_login affects email and socials
  if ((localKey === 'email' || localKey === 'socials') && remoteIds.has('social_login')) {
    return { shouldWarn: true, displayKey: localKey }
  }

  return { shouldWarn: false, displayKey: localKey }
}

/**
 * Transforms local config to handle alias mappings and special cases.
 * This ensures local config uses the same feature names as the final output.
 *
 * @param locals - Original local configuration
 * @returns Transformed local config with mapped keys
 */
function transformLocalConfig(locals: Layer): Layer {
  const transformed: Layer = {}

  for (const [key, value] of Object.entries(locals)) {
    // Map local key to SDK key (e.g., history → activity)
    const sdkKey = FEATURE_ID_ALIASES[key] || key
    transformed[sdkKey] = value
  }

  return transformed
}

/**
 * Builds a complete feature configuration bag by merging defaults, local config, and API config.
 * This is the core function that implements the configuration priority system:
 *
 * Priority Order:
 * 1. Basic mode: All features disabled (false)
 * 2. API success: API config is the source of truth, local config ignored
 * 3. API failure: Local config merged with defaults
 * 4. No local config: Use defaults
 *
 * Key Features:
 * - Generic: Works with ANY feature flag from the API
 * - Extensible: New API flags are automatically supported
 * - Type-safe: Uses Json type for flexible config values
 * - Fallback-aware: Graceful degradation when API fails
 *
 * @param params.defaults - Default feature values (usually from ConstantsUtil.DEFAULT_REMOTE_FEATURES)
 * @param params.locals - Local feature configuration from user's AppKit options
 * @param params.api - Remote feature configuration from Cloud Dashboard API
 * @param params.isApi - Whether API call was successful
 * @param params.isBasic - Whether basic mode is enabled (disables all features)
 * @returns Complete feature bag ready for normalization
 */
export function buildFeatureBag(params: {
  defaults: Layer
  locals: Layer
  api: ApiEntry[] | null | undefined
  isApi: boolean
  isBasic: boolean
}): { featureBag: FeatureBag; overriddenKeys: string[] } {
  const { defaults, api, isApi, isBasic } = params

  /* Transform local config to handle key mappings  */
  const locals = transformLocalConfig(params.locals)

  const apiMap: Record<
    string,
    { isEnabled: boolean; cfg: Json | undefined; skipEmptyArrayCheck?: boolean }
  > = {}
  const overriddenKeys: string[] = []

  if (Array.isArray(api)) {
    for (const { id, isEnabled, config } of api) {
      /* Map API ID to SDK feature name */
      const sdkKey = mapApiIdToSdkKey(id)

      /*
       * Handle special case: social_login splits into email + socials
       * For social_login, use the transformed values directly (don't apply empty array logic)
       */
      if (id === 'social_login') {
        const { email: hasEmail, socials } = transformSocialLogin(config ?? null)
        apiMap['email'] = {
          isEnabled: Boolean(isEnabled),
          cfg: hasEmail as Json,
          skipEmptyArrayCheck: true
        }
        apiMap['socials'] = {
          isEnabled: Boolean(isEnabled),
          cfg: socials,
          skipEmptyArrayCheck: true
        }
      } else {
        apiMap[sdkKey] = { isEnabled: Boolean(isEnabled), cfg: config ?? undefined }
      }
    }
  }

  /*
   * Detect warning cases - local config overridden by remote config
   * Use original local keys for warning detection, not transformed ones
   */
  if (isApi && params.locals) {
    const remoteIds = new Set(api?.map(f => f.id) || [])
    for (const localKey of Object.keys(params.locals)) {
      const { shouldWarn, displayKey } = detectWarning(localKey, remoteIds)
      if (shouldWarn) {
        overriddenKeys.push(`"features.${displayKey}"`)
      }
    }
  }

  /*
   * Collect feature keys from all sources
   * This ensures we don't miss any feature, whether it's in defaults, local config, or API
   */
  const keys = new Set([
    ...Object.keys(defaults ?? {}),
    ...Object.keys(locals ?? {}),
    ...Object.keys(apiMap)
  ])

  /*
   * Ensure all default properties are always included in the output
   * This guarantees consistent feature bag structure
   */
  if (defaults) {
    for (const key of Object.keys(defaults)) {
      keys.add(key)
    }
  }

  const out: FeatureBag = {}

  // Process each feature key
  for (const key of keys) {
    /*
     * Basic mode - all features disabled
     * When basic mode is enabled, all features are turned off regardless of other config
     */
    if (isBasic) {
      out[key] = false
    } else if (isApi) {
      /*
       * API success - API is the single source of truth
       * When API call succeeds, local configuration is ignored (with warnings)
       */
      if (apiMap[key]) {
        // Feature exists in API response
        const { isEnabled, cfg } = apiMap[key]
        if (isEnabled) {
          // Feature is enabled in API, determine the config value
          const borrowed = getFeatureValue(cfg, {
            locals,
            defaults,
            key,
            skipEmptyArrayCheck: apiMap[key]?.skipEmptyArrayCheck
          })
          out[key] = borrowed
        } else {
          // Feature is explicitly disabled in API
          out[key] = false
        }
      } else {
        /*
         * Feature not mentioned in API response = implicitly disabled
         * This is key for supporting new features: if API doesn't mention them, they're off
         */
        out[key] = false
      }
    } else if (locals && key in locals) {
      /*
       * Use local config with defaults as fallback
       * This provides graceful degradation when dashboard is unavailable
       */
      const localValue = locals[key] as Json

      /*
       * Special handling: Convert boolean true to default provider arrays
       * e.g., swaps: true → ['1inch'], onramp: true → ['meld']
       */
      if (localValue === true && defaults?.[key] && Array.isArray(defaults[key])) {
        out[key] = defaults[key] as Json
      } else {
        out[key] = localValue ?? false
      }
    } else {
      /*
       * No local config - use defaults
       * Final fallback for features not configured locally
       */
      out[key] = (defaults?.[key] as Json) ?? false
    }
  }

  return { featureBag: out, overriddenKeys }
}
