import type { CaipNetwork, ThemeVariables } from '@rerock/appkit-common'
import type {
  ChainAdapter,
  CustomWallet,
  Metadata,
  NetworkControllerState,
  Features,
  ThemeMode,
  Tokens,
  ProjectId
} from '@rerock/core'
import type { SIWEControllerClient, Web3ModalSIWEClient } from '@rerock/siwe'

export type AppKitOptions = {
  /**
   * Project ID to be used by the AppKit. Visit https://cloud.walletconnect.com/ to get your project ID.
   */
  projectId: ProjectId
  /**
   * Adapter array to be used by the AppKit.
   * @default []
   */
  adapters?: ChainAdapter[]
  /**
   * Features configuration object.
   * @default { swaps: true, onramp: true, email: true, socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'], history: true, analytics: true, allWallets: true }
   * @see https://docs.walletconnect.com/appkit/react/core/options#features
   */
  features?: Features
  /**
   * Show or hide the wallets in the modal. This is available with the email and socials features
   * @default true
   */
  showWallets?: boolean
  /**
   * Sign In With Ethereum configuration object.
   * @default undefined
   * @see https://docs.walletconnect.com/appkit/react/core/siwe#configure-your-siwe-client
   */
  siweConfig?: Web3ModalSIWEClient
  /**
   * Theme mode configuration flag. By default themeMode option will be set to user system settings.
   * @default `system`
   * @type `dark` | `light`
   * @see https://docs.walletconnect.com/appkit/react/core/theming
   */
  themeMode?: ThemeMode
  /**
   * Theme variable configuration object.
   * @default undefined
   * @see https://docs.walletconnect.com/appkit/react/core/theming#themevariables
   */
  themeVariables?: ThemeVariables
  /**
   * Allow users to switch to an unsupported chain.
   * @see https://docs.walletconnect.com/appkit/react/core/options#allowunsupportedchain
   */
  allowUnsupportedChain?: NetworkControllerState['allowUnsupportedCaipNetwork']
  /**
   * You can set the desired caipnetworks for the app:
   * @see https://docs.walletconnect.com/appkit/react/core/options#defaultchain
   */
  caipNetworks: CaipNetwork[]
  /**
   * You can set a desired caipnetwork for the initial connection:
   * @see https://docs.walletconnect.com/appkit/react/core/options#defaultchain
   */
  defaultCaipNetwork?: NetworkControllerState['caipNetwork']
  /**
   * Add or override the modal's network images.
   * @see https://docs.walletconnect.com/appkit/react/core/options#chainimages
   */
  chainImages?: Record<number | string, string>
  /**
   * Set or override the images of any connector. The key of each property must match the id of the connector.
   * @see https://docs.walletconnect.com/appkit/react/core/options#connectorimages
   */
  connectorImages?: Record<string, string>
  /**
   * A boolean that allows you to add or remove the "All Wallets" button on the modal
   * @default 'SHOW'
   * @see https://docs.walletconnect.com/appkit/react/core/options#allwallets
   */
  allWallets?: 'SHOW' | 'HIDE' | 'ONLY_MOBILE'
  /**
   * Array of wallet ids to be shown in the modal's connection view with priority. These wallets will also show up first in `All Wallets` view
   * @default []
   * @see https://docs.walletconnect.com/appkit/react/core/options#featuredwalletids
   */
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
  /**
   * You can enable or disable the SIWE feature in your AppKit.
   * @default false
   */
  isSiweEnabled?: boolean
  /**
   * Enable analytics to get more insights on your users activity within your WalletConnect Cloud's dashboard.
   * @default false
   * @see https://cloud.walletconnect.com/
   */
  metadata?: Metadata
  /**
   * Enable or disable the onramp feature in your AppKit.
   * @default true
   */

  disableAppend?: boolean
  /**
   * Enable or disable the WalletConnect qr code in your AppKit.
   * @default true
   */
  enableWalletConnect?: boolean
  /**
   * Enable or disable the EIP6963 feature in your AppKit.
   * @default false
   */
  enableEIP6963?: boolean
  /**
   * Enable or disable the Coinbase Wallet SDK in your AppKit.
   * @default false
   */
  enableCoinbase?: boolean
  /**
   * Enable or disable the Injected Wallets in your AppKit.
   * @default true
   */
  enableInjected?: boolean
  /**
   * Determines which wallet options to display in Coinbase Wallet SDK.
   * @property options
   *   - `all`: Show both smart wallet and EOA options.
   *   - `smartWalletOnly`: Show only smart wallet options.
   *   - `eoaOnly`: Show only EOA options.
   * @see https://www.smartwallet.dev/sdk/v3-to-v4-changes#parameters
   */
  coinbasePreference?: 'all' | 'smartWalletOnly' | 'eoaOnly'
  // -- Internal options ---------------------------------- //
  siweControllerClient?: SIWEControllerClient
}
