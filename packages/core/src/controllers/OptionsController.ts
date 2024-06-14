import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, snapshot } from 'valtio/vanilla'
import type {
  CaipNetwork,
  ChainAdapter,
  CustomWallet,
  Metadata,
  ProjectId,
  SdkVersion,
  ThemeMode,
  Tokens
} from '../utils/TypeUtil.js'
import type { ThemeVariables } from '@web3modal/common'
import type { NetworkControllerState } from './NetworkController.js'

// -- Types --------------------------------------------- //
export interface OptionsControllerState {
  projectId: ProjectId
  sdkType?: 'w3m'
  sdkVersion?: SdkVersion
  allWallets?: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
  featuredWalletIds?: string[]
  includeWalletIds?: string[]
  excludeWalletIds?: string[]
  tokens?: Tokens
  customWallets?: CustomWallet[]
  termsConditionsUrl?: string
  privacyPolicyUrl?: string
  isSiweEnabled?: boolean
  enableAnalytics?: boolean
  metadata?: Metadata
  enableOnramp?: boolean
  enableWalletFeatures?: boolean
  // -- Props that merged with all for AppKit transition
  themeMode?: ThemeMode
  themeVariables?: ThemeVariables
  defaultChain?: CaipNetwork
  allowUnsupportedChain?: NetworkControllerState['allowUnsupportedChain']
  siweConfig?: any
  chainImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  adapters?: ChainAdapter[]
}

type StateKey = keyof OptionsControllerState

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
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

  setEnableAnalytics(enableAnalytics: OptionsControllerState['enableAnalytics']) {
    state.enableAnalytics = enableAnalytics
  },

  setSdkVersion(sdkVersion: OptionsControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion
  },

  setMetadata(metadata: OptionsControllerState['metadata']) {
    state.metadata = metadata
  },

  setOnrampEnabled(enableOnramp: OptionsControllerState['enableOnramp']) {
    state.enableOnramp = enableOnramp
  },

  setWalletFeaturesEnabled(enableWalletFeatures: OptionsControllerState['enableWalletFeatures']) {
    state.enableWalletFeatures = enableWalletFeatures
  },

  getSnapshot() {
    return snapshot(state)
  }
}
