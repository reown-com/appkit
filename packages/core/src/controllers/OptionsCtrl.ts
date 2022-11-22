import { proxy } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChainId: undefined,
  chains: undefined,
  standaloneChains: undefined,
  standaloneUri: undefined,
  isStandalone: false,
  isCustomDesktop: false,
  isCustomMobile: false
})

// -- controller --------------------------------------------------- //
export const OptionsCtrl = {
  state,

  setChains(chains?: OptionsCtrlState['chains']) {
    state.chains = chains
  },

  setStandaloneChains(standaloneChains: OptionsCtrlState['standaloneChains']) {
    state.standaloneChains = standaloneChains
  },

  setStandaloneUri(standaloneUri: OptionsCtrlState['standaloneUri']) {
    state.standaloneUri = standaloneUri
  },

  setSelectedChainId(selectedChainId: OptionsCtrlState['selectedChainId']) {
    state.selectedChainId = selectedChainId
  },

  setIsStandalone(isStandalone: OptionsCtrlState['isStandalone']) {
    state.isStandalone = isStandalone
  },

  setIsCustomDesktop(isCustomDesktop: OptionsCtrlState['isCustomDesktop']) {
    state.isCustomDesktop = isCustomDesktop
  },

  setIsCustomMobile(isCustomMobile: OptionsCtrlState['isCustomMobile']) {
    state.isCustomMobile = isCustomMobile
  }
}
