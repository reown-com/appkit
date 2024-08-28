import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import type { CustomWallet, Metadata, ProjectId, SdkVersion, Tokens } from '../utils/TypeUtil.js'
import { ApiController } from './ApiController.js'

// -- Types --------------------------------------------- //
export type FeaturesSocials =
  | 'google'
  | 'x'
  | 'discord'
  | 'farcaster'
  | 'github'
  | 'apple'
  | 'facebook'

export type Features = {
  /**
   * @description Enable or disable the swaps feature. Enabled by default.
   * @type {boolean}
   */
  swaps?: boolean
  /**
   * @description Enable or disable the onramp feature. Enabled by default.
   * @type {boolean}
   */
  onramp?: boolean
  /**
   * @description Enable or disable the email feature. Enabled by default.
   * @type {boolean}
   */
  email?: boolean
  /**
   * @description Show or hide the regular wallet options when email is enabled. Enabled by default.
   * @type {boolean}
   */
  emailShowWallets?: boolean
  /**
   * @description Enable or disable the socials feature. Enabled by default.
   * @type {FeaturesSocials[]}
   */
  socials?: FeaturesSocials[]
  /**
   * @description Enable or disable the history feature. Enabled by default.
   * @type {boolean}
   */
  history?: boolean
  /**
   * @description Enable or disable the analytics feature. Enabled by default.
   * @type {boolean}
   */
  analytics?: boolean
  /**
   * @description Enable or disable the all wallets feature. Enabled by default.
   * @type {boolean}
   */
  allWallets?: boolean
}

export type FeaturesKeys = keyof Features

export interface OptionsControllerState {
  projectId: ProjectId
  sdkType: 'w3m'
  sdkVersion: SdkVersion
  allWallets?: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
  featuredWalletIds?: string[]
  includeWalletIds?: string[]
  excludeWalletIds?: string[]
  tokens?: Tokens
  customWallets?: CustomWallet[]
  termsConditionsUrl?: string
  privacyPolicyUrl?: string
  isSiweEnabled?: boolean
  metadata?: Metadata
  disableAppend?: boolean
  enableEIP6963?: boolean
  isUniversalProvider?: boolean
  hasMultipleAddresses?: boolean
  features: Features
}

type StateKey = keyof OptionsControllerState

// -- State --------------------------------------------- //
export const DEFAULT_FEATURES: Features = {
  swaps: true,
  onramp: true,
  email: true,
  emailShowWallets: true,
  socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'],
  history: true,
  analytics: true,
  allWallets: true
}

const state = proxy<OptionsControllerState>({
  features: DEFAULT_FEATURES,
  projectId: '',
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-undefined'
})

// -- Controller ---------------------------------------- //
export const OptionsController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: OptionsControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setOptions(options: OptionsControllerState) {
    Object.assign(state, options)
  },

  setFeatures(features: OptionsControllerState['features'] | undefined) {
    if (!features) {
      return
    }

    Object.entries(features).forEach(([key, value]) => {
      if (key in state.features) {
        ;(state.features as Record<keyof Features, unknown>)[key as keyof Features] = value
      }
    })
  },

  setProjectId(projectId: OptionsControllerState['projectId']) {
    state.projectId = projectId
  },

  setAllWallets(allWallets: OptionsControllerState['allWallets']) {
    state.allWallets = allWallets
  },

  setIncludeWalletIds(includeWalletIds: OptionsControllerState['includeWalletIds']) {
    state.includeWalletIds = includeWalletIds
  },

  setExcludeWalletIds(excludeWalletIds: OptionsControllerState['excludeWalletIds']) {
    state.excludeWalletIds = excludeWalletIds
    if (excludeWalletIds) {
      ApiController.searchWalletByIds({ ids: excludeWalletIds })
    }
  },

  setFeaturedWalletIds(featuredWalletIds: OptionsControllerState['featuredWalletIds']) {
    state.featuredWalletIds = featuredWalletIds
  },

  setTokens(tokens: OptionsControllerState['tokens']) {
    state.tokens = tokens
  },

  setTermsConditionsUrl(termsConditionsUrl: OptionsControllerState['termsConditionsUrl']) {
    state.termsConditionsUrl = termsConditionsUrl
  },

  setPrivacyPolicyUrl(privacyPolicyUrl: OptionsControllerState['privacyPolicyUrl']) {
    state.privacyPolicyUrl = privacyPolicyUrl
  },

  setCustomWallets(customWallets: OptionsControllerState['customWallets']) {
    state.customWallets = customWallets
  },

  setIsSiweEnabled(isSiweEnabled: OptionsControllerState['isSiweEnabled']) {
    state.isSiweEnabled = isSiweEnabled
  },

  setIsUniversalProvider(isUniversalProvider: OptionsControllerState['isUniversalProvider']) {
    state.isUniversalProvider = isUniversalProvider
  },

  setSdkVersion(sdkVersion: OptionsControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion
  },

  setMetadata(metadata: OptionsControllerState['metadata']) {
    state.metadata = metadata
  },

  setDisableAppend(disableAppend: OptionsControllerState['disableAppend']) {
    state.disableAppend = disableAppend
  },

  setEIP6963Enabled(enableEIP6963: OptionsControllerState['enableEIP6963']) {
    state.enableEIP6963 = enableEIP6963
  },

  setHasMultipleAddresses(hasMultipleAddresses: OptionsControllerState['hasMultipleAddresses']) {
    state.hasMultipleAddresses = hasMultipleAddresses
  }
}
