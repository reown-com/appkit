import { ClientCtrl } from './controllers/ClientCtrl'
import { ConfigCtrl } from './controllers/ConfigCtrl'

// -- public ------------------------------------------------------- //
export const Web3ModalCore = {
  configure: ConfigCtrl.setConfig,

  setEthereumClient: ClientCtrl.setEthereumClient,

  config: ConfigCtrl.state
}
