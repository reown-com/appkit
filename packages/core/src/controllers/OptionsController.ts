import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import type { CustomWallet, Metadata, ProjectId, SdkVersion, Tokens } from '../utils/TypeUtil.js'
import { ApiController } from './ApiController.js'

// -- Types --------------------------------------------- //
export interface OptionsControllerState {
  projectId: ProjectId
  sdkType: 'w3m'
  sdkVersion: SdkVersion
  /**
   * A boolean that allows you to add or remove the "All Wallets" button on the modal
   * @default 'SHOW'
   * @see https://docs.walletconnect.com/appkit/react/core/options#allwallets
   */
  allWallets?: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
  featuredWalletIds?: string[]
  /**
   * Array of wallet ids to be shown (order is respected). Unlike `featuredWalletIds`, these wallets will be the only ones shown in `All Wallets` view and as recommended wallets.
   * @default []
   * @see https://docs.walletconnect.com/appkit/react/core/options#includewalletids
   */
  includeWalletIds?: string[]
  /**
   * Array of wallet ids to be excluded from the wallet list in the modal.
   * @default []
   * @see https://docs.walletconnect.com/appkit/react/core/options#excludewalletids
   */
  excludeWalletIds?: string[]
  /**
   * Array of tokens to show the user's balance of. Each key represents the chain id of the token's blockchain
   * @default {}
   * @see https://docs.walletconnect.com/appkit/react/core/options#tokens
   */
  tokens?: Tokens
  /**
   * Add custom wallets to the modal. CustomWallets is an array of objects, where each object contains specific information of a custom wallet.
   * @default []
   * @see https://docs.walletconnect.com/appkit/react/core/options#customwallets
   *
   */
  customWallets?: CustomWallet[]
  /**
   * You can add an url for the terms and conditions link.
   * @default undefined
   */
  termsConditionsUrl?: string
  /**
   * You can add an url for the privacy policy link.
   * @default undefined
   */
  privacyPolicyUrl?: string
  isSiweEnabled?: boolean
  isUniversalProvider?: boolean
  /**
   * Enable analytics to get more insights on your users activity within your WalletConnect Cloud's dashboard.
   * @default false
   * @see https://cloud.walletconnect.com/
   */
  enableAnalytics?: boolean
  metadata?: Metadata
  /**
   * Enable or disable the onramp feature in your AppKit.
   * @default true
   */
  enableOnramp?: boolean
  hasMultipleAddresses?: boolean
  disableAppend?: boolean
  enableEIP6963?: boolean
  /**
   * Enable or disable the onramp feature in your AppKit.
   * @default true
   */
  enableSwaps?: boolean
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

  setDisableAppend(disableAppend: OptionsControllerState['disableAppend']) {
    state.disableAppend = disableAppend
  },

  setEIP6963Enabled(enableEIP6963: OptionsControllerState['enableEIP6963']) {
    state.enableEIP6963 = enableEIP6963
  },

  setHasMultipleAddresses(hasMultipleAddresses: OptionsControllerState['hasMultipleAddresses']) {
    state.hasMultipleAddresses = hasMultipleAddresses
  },

  setEnableSwaps(enableSwaps: OptionsControllerState['enableSwaps']) {
    state.enableSwaps = enableSwaps
  }
}
