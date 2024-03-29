import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import type { BlockchainApiEnsError } from '../utils/TypeUtil.js'
import { SnackController } from './SnackController.js'
// -- Types --------------------------------------------- //

export interface EnsControllerState {
  name: string
  suggestions: string[]
  error: string
}

type StateKey = keyof EnsControllerState

// -- State --------------------------------------------- //
const state = proxy<EnsControllerState>({
  name: '',
  suggestions: [],
  error: ''
})

// -- Controller ---------------------------------------- //
export const EnsController = {
  state,

  subscribe(callback: (newState: EnsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: EnsControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setName(name: EnsControllerState['name']) {
    state.name = name
  },

  setSuggestions(suggestions: EnsControllerState['suggestions']) {
    state.suggestions = suggestions
  },

  async resolveName(name: string) {
    try {
      return await BlockchainApiController.lookupEnsName(name)
    } catch (e) {
      const error = e as BlockchainApiEnsError
      const errorMessage = error?.reasons?.[0]?.description || 'Error resolving ENS name'
      state.error = errorMessage

      return null
    }
  },

  async isNameRegistered(name: string) {
    try {
      await BlockchainApiController.lookupEnsName(name)

      return true
    } catch {
      return false
    }
  },

  async getNamesForAddress(address: string) {
    try {
      return await BlockchainApiController.reverseLookupEnsName(address)
    } catch (e) {
      const error = e as BlockchainApiEnsError
      const errorMessage = error?.reasons?.[0]?.description || 'Error resolving address to ENS name'
      state.error = errorMessage

      return null
    }
  }
}
