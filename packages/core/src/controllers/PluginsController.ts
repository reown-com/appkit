import { proxy } from 'valtio/vanilla'
import type { SIWEPlugin } from '@web3modal/types'

// -- Types --------------------------------------------- //
export interface PluginsControllerState {
  SIWEPlugin?: SIWEPlugin
}

// -- State --------------------------------------------- //
const state = proxy<PluginsControllerState>({})

// -- Controller ---------------------------------------- //
export const PluginsController = {
  state,
  initSIWE(params: PluginsControllerState['SIWEPlugin']) {
    state.SIWEPlugin = params
  },
  get SIWEPlugin() {
    return this.state.SIWEPlugin
  }
}
