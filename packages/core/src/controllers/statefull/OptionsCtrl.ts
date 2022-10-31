import { proxy } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChainId: undefined,
  chains: undefined
})

// -- controller --------------------------------------------------- //
export const OptionsCtrl = {
  state,

  setChains(chains?: OptionsCtrlState['chains']) {
    state.chains = chains
  },

  setSelectedChainId(selectedChainId: OptionsCtrlState['selectedChainId']) {
    state.selectedChainId = selectedChainId
  }
}
