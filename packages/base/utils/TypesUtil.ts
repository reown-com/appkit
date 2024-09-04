import type { ThemeVariables } from '@web3modal/common'
import type {
  NetworkControllerState,
  OptionsControllerState,
  ThemeMode,
  Token
} from '@web3modal/core'
import type { SIWEControllerClient, Web3ModalSIWEClient } from '@web3modal/siwe'

export type AppKitOptions<ChainType = NetworkControllerState['caipNetwork']> =
  OptionsControllerState & {
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
    allowUnsupportedChain?: NetworkControllerState['allowUnsupportedChain']
    /**
     * You can set a desired chain for the initial connection:
     * @see https://docs.walletconnect.com/appkit/react/core/options#defaultchain
     */
    defaultChain?: ChainType
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
     * Tokens for AppKit to show the user's balance of.
     * @see https://docs.walletconnect.com/appkit/react/core/options#tokens
     */
    tokens?: Record<number, Token>
    // -- Internal options ---------------------------------- //
    siweControllerClient?: SIWEControllerClient
  }
