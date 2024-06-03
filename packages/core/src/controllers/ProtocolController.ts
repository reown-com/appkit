import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type { AdapterCore } from '../utils/TypeUtil.js'
import { ConnectionController } from './ConnectionController.js'
import { NetworkController } from './NetworkController.js'

// -- Types --------------------------------------------- //
type Protocol = 'evm' | 'solana' | 'bitcoin'

export interface ProtocolControllerState {
  activeProtocol?: Protocol
  adapters: AdapterCore[]
}

type StateKey = keyof ProtocolControllerState

// -- State --------------------------------------------- //
const state = proxy<ProtocolControllerState>({
  adapters: []
})

// -- Controller ---------------------------------------- //
export const ProtocolController = {
  state,

  subscribe(callback: (newState: ProtocolControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ProtocolControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setAdapters(adapters: AdapterCore[]) {
    state.adapters = adapters.map(a => ref(a))
  },

  getAdapter(protocol: Protocol) {
    return state.adapters.find(a => a.protocol === protocol)
  },

  switchProtocol(protocol: Protocol) {
    state.activeProtocol = protocol
    const adapter = this.getAdapter(protocol)
    if (adapter) {
      ConnectionController.setClient(adapter.connectionControllerClient)
      NetworkController.setClient(adapter.networkControllerClient)
      adapter.initialize()
    }
  }
}
