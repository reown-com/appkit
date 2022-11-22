import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ConfigCtrlState } from '../types/controllerTypes'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

const state = proxy<ConfigCtrlState>({
  theme: isDarkMode() ? 'dark' : 'light',
  accentColor: 'default',
  projectId: undefined,
  standaloneChains: undefined,
  mobileWallets: undefined,
  desktopWallets: undefined,
  walletImages: undefined,
  chainImages: undefined
})

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: ConfigCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setConfig(config: ConfigCtrlState) {
    if (config.standaloneChains?.length) {
      OptionsCtrl.setStandaloneChains(config.standaloneChains)
      OptionsCtrl.setIsStandalone(true)
    }
    if (config.mobileWallets?.length) {
      OptionsCtrl.setIsCustomMobile(true)
    }
    if (config.desktopWallets?.length) {
      OptionsCtrl.setIsCustomDesktop(true)
    }
    Object.assign(state, config)
  }
}
