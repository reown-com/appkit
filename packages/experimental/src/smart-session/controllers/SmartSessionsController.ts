import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import type { SmartSession } from '../utils/TypeUtils.js'
import { AccountController, BlockchainApiController, SnackController } from '@reown/appkit-core'

// -- Types --------------------------------------------- //
export type SmartSessionsControllerState = {
  sessions: SmartSession[]
}

type StateKey = keyof SmartSessionsControllerState

// -- State --------------------------------------------- //
const state = proxy<SmartSessionsControllerState>({
  sessions: []
})

// -- Controller ---------------------------------------- //
export const SmartSessionsController = {
  state,
  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: SmartSessionsControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },
  async getSmartSessions() {
    try {
      const caipAddress = AccountController.state.caipAddress
      if (!caipAddress) {
        return []
      }

      const sessions = (await BlockchainApiController.getSmartSessions(caipAddress)) as {
        pcis: SmartSession[]
      }

      state.sessions = sessions.pcis.map(session => ({
        ...session,
        expiry: session.expiry * 1000
      }))

      return sessions.pcis
    } catch (e) {
      SnackController.showError('Error fetching smart sessions')

      state.sessions = []

      return []
    }
  }
}
