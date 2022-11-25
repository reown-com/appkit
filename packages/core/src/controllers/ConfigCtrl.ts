import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ConfigCtrlState } from '../types/controllerTypes'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

const state = proxy<ConfigCtrlState>({
  themeMode: isDarkMode() ? 'dark' : 'light',
  themeColor: 'default',
  themeBackground: 'gradient',
  projectId: undefined,
  standaloneChains: undefined,
  mobileWallets: undefined,
  desktopWallets: undefined,
  walletImages: undefined,
  chainImages: undefined,
  enableStandaloneMode: false,
  enableNetworkView: true
})

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: ConfigCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setConfig(config: ConfigCtrlState) {
    OptionsCtrl.setStandaloneChains(config.standaloneChains)
    OptionsCtrl.setIsStandalone(
      Boolean(config.standaloneChains?.length) || Boolean(config.enableStandaloneMode)
    )
    OptionsCtrl.setIsCustomMobile(Boolean(config.mobileWallets?.length))
    OptionsCtrl.setIsCustomDesktop(Boolean(config.desktopWallets?.length))
    OptionsCtrl.setIsExplorer(Boolean(config.projectId?.length))

    Object.assign(state, config)
  },

  setThemeConfig(theme: Pick<ConfigCtrlState, 'themeBackground' | 'themeColor' | 'themeMode'>) {
    Object.assign(state, theme)
  }
}
