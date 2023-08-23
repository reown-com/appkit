import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { ProjectId } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
export interface OptionsControllerState {
  projectId: ProjectId
  includeWalletIds?: string[]
  excludeWalletIds?: string[]
}

type StateKey = keyof OptionsControllerState

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: ''
})

// -- Controller ---------------------------------------- //
export const OptionsController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: OptionsControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setProjectId(projectId: OptionsControllerState['projectId']) {
    state.projectId = projectId
  },

  setIncludeWalletIds(includeWalletIds: OptionsControllerState['includeWalletIds']) {
    state.includeWalletIds = includeWalletIds
  },

  setExcludeWalletIds(excludeWalletIds: OptionsControllerState['excludeWalletIds']) {
    state.excludeWalletIds = excludeWalletIds
  }
}
