import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../types/controllerTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChain: undefined,
  chains: undefined,
  isCustomDesktop: false,
  isCustomMobile: false,
  isDataLoaded: false,
  isUiLoaded: false,
  isPreferInjected: false
})

// -- controller --------------------------------------------------- //
export const OptionsCtrl = {
  state,

  subscribe(callback: (newState: OptionsCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setChains(chains?: OptionsCtrlState['chains']) {
    state.chains = chains
  },

  getSelectedChain() {
    const selectedChain = ClientCtrl.client().getNetwork().chain
    if (selectedChain) {
      state.selectedChain = selectedChain
    }

    return state.selectedChain
  },

  setSelectedChain(selectedChain: OptionsCtrlState['selectedChain']) {
    state.selectedChain = selectedChain
  },

  setIsCustomDesktop(isCustomDesktop: OptionsCtrlState['isCustomDesktop']) {
    state.isCustomDesktop = isCustomDesktop
  },

  setIsCustomMobile(isCustomMobile: OptionsCtrlState['isCustomMobile']) {
    state.isCustomMobile = isCustomMobile
  },

  setIsDataLoaded(isDataLoaded: OptionsCtrlState['isDataLoaded']) {
    state.isDataLoaded = isDataLoaded
  },

  setIsUiLoaded(isUiLoaded: OptionsCtrlState['isUiLoaded']) {
    state.isUiLoaded = isUiLoaded
  },

  setIsPreferInjected(isPreferInjected: OptionsCtrlState['isPreferInjected']) {
    state.isPreferInjected = isPreferInjected
  }
}
