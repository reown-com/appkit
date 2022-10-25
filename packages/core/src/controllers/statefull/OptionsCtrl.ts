import { proxy } from 'valtio/vanilla'
import type { OptionsCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  selectedChainId: undefined
})

// -- controller --------------------------------------------------- //
export const OptionsCtrl = {
  state,

  setSelectedChainId(selectedChainId: number) {
    state.selectedChainId = selectedChainId
  }
}
