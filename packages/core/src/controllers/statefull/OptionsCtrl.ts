import { proxy } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChainId: undefined,
  chains: undefined,
  standaloneChains: undefined,
  standaloneUri: undefined
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
  }
}
