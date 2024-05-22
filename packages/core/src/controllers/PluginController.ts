import { proxy, subscribe as sub } from 'valtio/vanilla'

import { type ActivityController } from '../types/ActivityPlugin'

// -- Types --------------------------------------------- //
export interface PluginControllerState {
  user?: string | null
  activityController?: any
}

// -- State --------------------------------------------- //
const state = proxy<PluginControllerState>({})

// -- Controller ---------------------------------------- //
export const PluginController = {
  state,

  activityController: undefined as ActivityController | undefined,

  subscribe(callback: (newState: PluginControllerState) => void) {
    return sub(state, () => callback(state))
  },

  async initialize(plugins: { activityController?: ActivityController }) {
    if (plugins.activityController) {
      this.activityController = plugins.activityController
      this.activityController.initialize()
    }
  }
}
