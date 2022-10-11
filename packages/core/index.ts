export { ClientCtrl } from './src/controllers/statefull/ClientCtrl'
export { ConfigCtrl } from './src/controllers/statefull/ConfigCtrl'
export { ConnectModalCtrl } from './src/controllers/statefull/ConnectModalCtrl'
export { ExplorerCtrl } from './src/controllers/statefull/ExplorerCtrl'
export { ModalToastCtrl } from './src/controllers/statefull/ModalToastCtrl'
export { RouterCtrl } from './src/controllers/statefull/RouterCtrl'
export { AccountCtrl } from './src/controllers/stateless/AccountCtrl'
export { BalanceCtrl } from './src/controllers/stateless/BalanceCtrl'
export { BlockCtrl } from './src/controllers/stateless/BlockCtrl'
export { ContractCtrl } from './src/controllers/stateless/ContractCtrl'
export { EnsCtrl } from './src/controllers/stateless/EnsCtrl'
export { FeeCtrl } from './src/controllers/stateless/FeeCtrl'
export { NetworkCtrl } from './src/controllers/stateless/NetworkCtrl'
export { ProviderCtrl } from './src/controllers/stateless/ProviderCtrl'
export { SignerCtrl } from './src/controllers/stateless/SignerCtrl'
export { TokenCtrl } from './src/controllers/stateless/TokenCtrl'
export { TransactionCtrl } from './src/controllers/stateless/TransactionCtrl'
export { WebSocketProviderCtrl } from './src/controllers/stateless/WebSocketProviderCtrl'
export { CoreHelpers } from './src/utils/CoreHelpers'
export { getExplorerApi } from './src/utils/ExplorerApi'
export type {
  ConfigOptions,
  Listing,
  ListingResponse,
  RouterView
} from './types/statefullCtrlTypes'
export type {
  AccountCtrlGetReturnValue,
  BalanceCtrlFetchArgs,
  BalanceCtrlFetchReturnValue,
  ContractCtrlGetArgs,
  ContractCtrlReadArgs,
  ContractCtrlWatchEventArgs,
  ContractCtrlWriteArgs,
  EnsCtrlFetchEnsAddressArgs,
  EnsCtrlFetchEnsAvatarArgs,
  EnsCtrlFetchEnsNameArgs,
  EnsCtrlFetchEnsResolverArgs,
  FeeCtrlFetchArgs,
  FeeCtrlFetchReturnValue,
  NetworkCtrlGetReturnValue,
  NetworkCtrlSwitchNetworkArgs,
  SignerCtrlSignMessageArgs,
  SignerCtrlSignTypedDataArgs,
  TokenCtrlFetchArgs,
  TransactionCtrlFetchArgs,
  TransactionCtrlSendArgs,
  TransactionCtrlWaitArgs
} from './types/statelessCtrlTypes'

// -- vanilla ----------------------------------------------- //
import { ClientCtrl } from './src/controllers/statefull/ClientCtrl'
import { ConfigCtrl } from './src/controllers/statefull/ConfigCtrl'
import { ConnectModalCtrl } from './src/controllers/statefull/ConnectModalCtrl'
import { AccountCtrl } from './src/controllers/stateless/AccountCtrl'
import { BalanceCtrl } from './src/controllers/stateless/BalanceCtrl'
import { BlockCtrl } from './src/controllers/stateless/BlockCtrl'
import { ContractCtrl } from './src/controllers/stateless/ContractCtrl'
import { EnsCtrl } from './src/controllers/stateless/EnsCtrl'
import { FeeCtrl } from './src/controllers/stateless/FeeCtrl'
import { NetworkCtrl } from './src/controllers/stateless/NetworkCtrl'
import { ProviderCtrl } from './src/controllers/stateless/ProviderCtrl'
import { SignerCtrl } from './src/controllers/stateless/SignerCtrl'
import { TokenCtrl } from './src/controllers/stateless/TokenCtrl'
import { TransactionCtrl } from './src/controllers/stateless/TransactionCtrl'
import { WebSocketProviderCtrl } from './src/controllers/stateless/WebSocketProviderCtrl'

const Web3ModalCore = {
  client: ClientCtrl,
  config: ConfigCtrl,
  connectModal: ConnectModalCtrl,
  account: AccountCtrl,
  balance: BalanceCtrl,
  block: BlockCtrl,
  contract: ContractCtrl,
  ens: EnsCtrl,
  fees: FeeCtrl,
  network: NetworkCtrl,
  provider: ProviderCtrl,
  signer: SignerCtrl,
  token: TokenCtrl,
  transaction: TransactionCtrl,
  websocketProvder: WebSocketProviderCtrl
}

if (typeof window !== 'undefined') window.Web3ModalCore = Web3ModalCore

declare global {
  interface Window {
    Web3ModalCore: typeof Web3ModalCore
  }
}
