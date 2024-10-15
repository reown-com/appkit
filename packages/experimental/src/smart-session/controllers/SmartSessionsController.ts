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
      state.sessions = sessions.pcis

      return sessions.pcis
    } catch (e) {
      SnackController.showError('Error fetching smart sessions')

      const MOCK_SESSIONS: SmartSession[] = [
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'data:image/png;base64,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'
          },
          pci: '0x123',
          expiration: Date.now() + 10_000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 10_000,
          context: '0x123'
        },
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'data:image/png;base64,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'
          },
          pci: '0x123',
          expiration: Date.now() - 5000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 15_000,
          context: '0x123'
        },
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'data:image/png;base64,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'
          },
          pci: '0x123',
          expiration: Date.now() + 10_000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 10_000,
          context: '0x123',
          revokedAt: Date.now()
        }
      ]

      state.sessions = MOCK_SESSIONS

      return MOCK_SESSIONS
    }
  }
}
