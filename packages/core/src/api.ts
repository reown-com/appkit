import { ConfigCtrl } from './controllers/ConfigCtrl'

export const Web3ModalCore = {
  configure: ConfigCtrl.setConfig,

  config: ConfigCtrl.state
}
