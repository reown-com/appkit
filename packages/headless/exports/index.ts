// -- Client -------------------------------------------------------------------
export {
  HeadlessClient,
  createAppKitHeadless,
  getHeadlessClient
} from '../src/client/headless-client.js'
export type {
  HeadlessOptions,
  CreateAppKitHeadlessOptions,
  Views,
  OpenOptions
} from '../src/client/headless-client.js'

// -- Controllers (re-export commonly used) ------------------------------------
export {
  ChainController,
  ConnectionController,
  ConnectorController,
  OptionsController,
  PublicStateController,
  ProviderController,
  ThemeController,
  EventsController,
  AlertController,
  ModalController,
  RouterController,
  StorageUtil,
  CoreHelperUtil,
  AssetUtil
} from '@reown/appkit-controllers'

// -- Types --------------------------------------------------------------------
export type {
  CaipNetwork,
  CaipAddress,
  CaipNetworkId,
  AppKitNetwork,
  ChainNamespace
} from '@reown/appkit-common'

export type {
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn,
  ConnectedWalletInfo,
  ThemeControllerState,
  PublicStateControllerState,
  Features,
  RemoteFeatures
} from '@reown/appkit-controllers'
