import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../types/controllerTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChain: undefined,
  chains: undefined,
  standaloneChains: undefined,
  standaloneUri: undefined,
  address: undefined,
  profileName: undefined,
  profileAvatar: undefined,
  balance: undefined,
  isConnected: false,
  isStandalone: false,
  isCustomDesktop: false,
  isCustomMobile: false,
  isExplorer: false
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

  setStandaloneChains(standaloneChains: OptionsCtrlState['standaloneChains']) {
    state.standaloneChains = standaloneChains
  },

  setStandaloneUri(standaloneUri: OptionsCtrlState['standaloneUri']) {
    state.standaloneUri = standaloneUri
  },

  getSelectedChain() {
    if (!state.selectedChain) {
      const selectedChain = ClientCtrl.client().getNetwork().chain
      state.selectedChain = selectedChain
    }

    return state.selectedChain
  },

  setSelectedChain(selectedChain: OptionsCtrlState['selectedChain']) {
    state.selectedChain = selectedChain
  },

  setIsStandalone(isStandalone: OptionsCtrlState['isStandalone']) {
    state.isStandalone = isStandalone
  },

  setIsCustomDesktop(isCustomDesktop: OptionsCtrlState['isCustomDesktop']) {
    state.isCustomDesktop = isCustomDesktop
  },

  setIsCustomMobile(isCustomMobile: OptionsCtrlState['isCustomMobile']) {
    state.isCustomMobile = isCustomMobile
  },

  setIsExplorer(isExplorer: OptionsCtrlState['isExplorer']) {
    state.isExplorer = isExplorer
  },

  getAccount() {
    const account = ClientCtrl.client().getAccount()
    state.address = account.address
    state.isConnected = account.isConnected
  },

  setAddress(address: OptionsCtrlState['address']) {
    state.address = address
  },

  setIsConnected(isConnected: OptionsCtrlState['isConnected']) {
    state.isConnected = isConnected
  },

  setProfileName(profileName: OptionsCtrlState['profileName']) {
    state.profileName = profileName
  },

  setProfileAvatar(profileAvatar: OptionsCtrlState['profileAvatar']) {
    state.profileAvatar = profileAvatar
  },

  setBalance(balance: OptionsCtrlState['balance']) {
    state.balance = balance
  },

  resetProfile() {
    state.profileName = undefined
    state.profileAvatar = undefined
    state.balance = undefined
  },

  resetAccount() {
    state.address = undefined
    OptionsCtrl.resetProfile()
  }
}
