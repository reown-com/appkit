import type UniversalProvider from '@walletconnect/universal-provider'

import type {
  AppKitNetwork,
  OnRampProvider,
  SocialProvider,
  SwapProvider,
  ThemeVariables
} from '@reown/appkit-common'
import type {
  ChainAdapter,
  FeatureID,
  Metadata,
  OptionsControllerState,
  RemoteFeatures,
  ThemeMode
} from '@reown/appkit-controllers'
import type { AppKitSIWEClient } from '@reown/appkit-siwe'

export type AppKitOptions = {
  /**
   * Adapter array to be used by the AppKit.
   * @default []
   */
  adapters?: ChainAdapter[]
  /**
   * This is only used for the @walletconnect/ethereum-provider package. We need this to determine which screens should be shown.
   * @default false
   */
  basic?: boolean
  /**
   * Show or hide the wallets in the modal. This is available with the email and socials features
   * @default true
   */
  showWallets?: boolean
  /**
   * Sign In With Ethereum configuration object.
   * @default undefined
   * @see https://docs.reown.com/appkit/react/core/siwe#configure-your-siwe-client
   */
  siweConfig?: AppKitSIWEClient
  /**
   * Theme mode configuration flag. By default themeMode option will be set to user system settings.
   * @default `system`
   * @type `dark` | `light`
   * @see https://docs.reown.com/appkit/react/core/theming
   */
  themeMode?: ThemeMode
  /**
   * Theme variable configuration object.
   * @default undefined
   * @see https://docs.reown.com/appkit/react/core/theming#themevariables
   */
  themeVariables?: ThemeVariables
  /**
   * Allow users to switch to an unsupported chain.
   * @see https://docs.reown.com/appkit/react/core/options#allowunsupportedchain
   */
  allowUnsupportedChain?: boolean
  /**
   * You can set the desired caipnetworks for the app:
   * @see https://docs.reown.com/appkit/react/core/options#defaultchain
   */
  networks: [AppKitNetwork, ...AppKitNetwork[]]
  /**
   * You can set a desired caipnetwork for the initial connection:
   * @see https://docs.reown.com/appkit/react/core/options#defaultchain
   */
  defaultNetwork?: AppKitNetwork
  /**
   * Add or override the modal's network images.
   * @see https://docs.reown.com/appkit/react/core/options#chainimages
   */
  chainImages?: Record<number | string, string>
  /**
   * Set or override the images of any connector. The key of each property must match the id of the connector.
   * @see https://docs.reown.com/appkit/react/core/options#connectorimages
   */
  connectorImages?: Record<string, string>
  /**
   * Determines which wallet options to display in Coinbase Wallet SDK.
   * @property options
   *   - `all`: Show both smart wallet and EOA options.
   *   - `smartWalletOnly`: Show only smart wallet options.
   *   - `eoaOnly`: Show only EOA options.
   * @see https://www.smartwallet.dev/sdk/v3-to-v4-changes#parameters
   */
  coinbasePreference?: 'all' | 'smartWalletOnly' | 'eoaOnly'
  /**
   * Enable analytics to get more insights on your users activity within your Reown Cloud's dashboard.
   * @default false
   * @see https://cloud.walletconnect.com/
   */
  metadata?: Metadata
  /**
   * UniversalProvider instance to be used by AppKit.
   * AppKit will generate its own instance by default in none provided
   * @default undefined
   */
  universalProvider?: UniversalProvider
  /**
   * The default account type used for each chain namespace.
   * @default "{ bip122: 'payment', eip155: 'smartAccount', polkadot: 'eoa', solana: 'eoa' }"
   */
  defaultAccountTypes?: Partial<OptionsControllerState['defaultAccountTypes']>
} & Omit<OptionsControllerState, 'defaultAccountTypes'>

export interface FeatureConfigItem {
  featureName: keyof RemoteFeatures
  apiFeatureName: FeatureID
  localFeatureName: string
  defaultValue: boolean | SocialProvider[] | SwapProvider[] | OnRampProvider[]
  isActivityHistory?: boolean
}
