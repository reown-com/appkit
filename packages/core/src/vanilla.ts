import { AccountCtrl } from './controllers/AccountCtrl'
import { ClientCtrl } from './controllers/ClientCtrl'
import { ConfigCtrl } from './controllers/ConfigCtrl'
import { ConnectModalCtrl } from './controllers/ConnectModalCtrl'
import { ExplorerCtrl } from './controllers/ExplorerCtrl'
import { RouterCtrl } from './controllers/RouterCtrl'

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
