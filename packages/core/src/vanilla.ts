import { AccountCtrl } from './controllers/blockchain/AccountCtrl'
import { ClientCtrl } from './controllers/blockchain/ClientCtrl'
import { ConfigCtrl } from './controllers/ui/ConfigCtrl'
import { ConnectModalCtrl } from './controllers/ui/ConnectModalCtrl'
import { ExplorerCtrl } from './controllers/ui/ExplorerCtrl'
import { RouterCtrl } from './controllers/ui/RouterCtrl'

const Web3ModalCore = {
  ClientCtrl,
  ConfigCtrl,
  ExplorerCtrl,
  ConnectModalCtrl,
  RouterCtrl,
  AccountCtrl
}

if (typeof window !== 'undefined') window.Web3ModalCore = Web3ModalCore

declare global {
  interface Window {
    Web3ModalCore: typeof Web3ModalCore
  }
}
