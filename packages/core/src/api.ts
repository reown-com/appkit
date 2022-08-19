import { ConfigCtrl } from './controllers/ConfigCtrl'

export const Web3Modal = {
  configure: ConfigCtrl.setConfig,

  config: ConfigCtrl.state
}

/**
 * Expose global api for vanilla js
 */
window.Web3Modal = Web3Modal

declare global {
  interface Window {
    Web3Modal: typeof Web3Modal
  }
}
